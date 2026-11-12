#!/usr/bin/env python3
"""Génération hebdomadaire, validation stricte et publication idempotente."""
import datetime as dt
import json
import os
import pathlib
import re
import sys
import urllib.request
from zoneinfo import ZoneInfo

DEST = pathlib.Path("data/weekly-cases.json")
PARIS = ZoneInfo("Europe/Paris")


def fail(message):
    raise ValueError(message)


def valid_case(c):
    def check(ok, message):
        if not ok:
            fail(message)
    check(isinstance(c, dict), "Le dossier doit être un objet")
    check(isinstance(c.get("id"), str) and re.fullmatch(r"hebdo-\d{4}-\d{2}-\d{2}", c["id"]) is not None, "ID invalide")
    check(type(c.get("niv")) is int and c["niv"] in (1, 2, 3), "Difficulté incompatible")
    for key in ("titre", "accroche", "intro"):
        check(isinstance(c.get(key), str) and 20 <= len(c[key]) <= 1800, key + " invalide")
    clues = c.get("indices")
    check(isinstance(clues, dict) and 7 <= len(clues) <= 16, "Nombre d'indices incorrect")
    for key, value in clues.items():
        check(re.fullmatch(r"[a-z][a-z0-9_]{1,30}", key) is not None, "ID d'indice invalide")
        check(isinstance(value, dict) and all(isinstance(value.get(k), str) and len(value[k]) >= 12 for k in ("n", "t")), "Indice incomplet")
    places = c.get("lieux")
    check(isinstance(places, list) and 3 <= len(places) <= 5, "Lieux invalides")
    place_ids = set()
    obtainable = set()
    for place in places:
        check(isinstance(place, dict), "Lieu invalide")
        check(all(isinstance(place.get(k), str) and place[k] for k in ("id", "nom", "desc")), "Lieu incomplet")
        check(place["id"] not in place_ids, "Lieu dupliqué")
        place_ids.add(place["id"])
        objects = place.get("objets")
        check(isinstance(objects, list) and objects and all(isinstance(x, str) and x in clues for x in objects), "Objet inconnu")
        obtainable.update(objects)
    suspects = c.get("suspects")
    check(isinstance(suspects, list) and 3 <= len(suspects) <= 5, "Suspects invalides")
    ids = set()
    for suspect in suspects:
        check(isinstance(suspect, dict), "Suspect invalide")
        check(all(isinstance(suspect.get(k), str) and suspect[k] for k in ("id", "nom", "role", "alibi")), "Suspect incomplet")
        check(type(suspect.get("age")) is int and 18 <= suspect["age"] <= 100, "Age invalide")
        check(suspect["id"] not in ids, "Suspect dupliqué")
        ids.add(suspect["id"])
        qs = suspect.get("qs")
        check(isinstance(qs, list) and len(qs) >= 3 and all(isinstance(q, dict) and isinstance(q.get("q"), str) and isinstance(q.get("a"), str) and len(q["a"]) >= 15 and (not q.get("gain") or q["gain"] in clues) for q in qs), "Interrogatoire incomplet")
        conf = suspect.get("conf", {})
        check(isinstance(conf, dict) and all(k in clues and isinstance(v, dict) and isinstance(v.get("t"), str) and (not v.get("gain") or v["gain"] in clues) for k, v in conf.items()), "Confrontation invalide")
    solution = c.get("solution")
    check(isinstance(solution, dict) and solution.get("coupable") in ids, "Coupable absent")
    proofs = solution.get("preuves")
    check(isinstance(proofs, list) and len(proofs) >= 3 and len(set(proofs)) == len(proofs) and set(proofs) <= set(clues), "Preuves invalides")
    check(set(proofs) <= obtainable, "Preuves inaccessibles sur les lieux")
    check(isinstance(solution.get("expl"), str) and len(solution["expl"]) >= 250, "Conclusion insuffisante")
    hints = c.get("hints")
    check(isinstance(hints, list) and len(hints) >= 3 and all(isinstance(h, str) and len(h) >= 15 for h in hints), "Conseils insuffisants")
    # Contrôles de structure : une validation sémantique parfaite ne peut pas être garantie automatiquement.
    return c


def request_case(case_id, attempt, previous):
    prompt = f"""Écris UNE enquête policière française originale, réaliste, jouable et entièrement résoluble, en JSON brut.
Schéma EXACT:
{{"id":"{case_id}","niv":2,"titre":"...","accroche":"...","intro":"...",
"indices":{{"indice_a":{{"n":"Nom","t":"Description précise"}}}},
"lieux":[{{"id":"lieu_a","nom":"Nom","desc":"Description","objets":["indice_a"]}}],
"suspects":[{{"id":"suspect_a","nom":"Prénom Nom","age":34,"role":"Métier","alibi":"...","qs":[{{"q":"Question","a":"Réponse","gain":"indice_a"}}],"conf":{{"indice_a":{{"t":"Réaction"}}}}}}],
"solution":{{"coupable":"suspect_a","preuves":["indice_a","indice_b","indice_c"],"expl":"Reconstitution chronologique et preuve du mobile et de l'acte."}},
"hints":["...","...","..."]}}
Contraintes impératives :
- 3 à 5 suspects adultes, 3 à 5 lieux, 7 à 16 indices, au moins 3 questions par suspect.
- Tous les indices de solution accessibles dans objets des lieux; tous les objets référencent indices.
- Les preuves doivent exclure les innocents, être indépendantes et cohérentes avec horaires, accès, mobile et moyens.
- Un coupable UNIQUE déterminé dès le début, jamais une fin ouverte; conclusion précise, vérifiable et non contradictoire.
- Au moins trois preuves pour l'accusation; aucun indice inventé dans la conclusion.
- Éviter tout cliché, tout personnage ou affaire déjà utilisé; noms français plausibles; pas de surnaturel.
- JSON en français, aucune balise HTML, aucune clé supplémentaire.
- ID strictement {case_id}. Difficulté {1 + (int(case_id[-2:]) % 3)}.
- Tentative {attempt}. Thèmes récents à éviter: {previous}.
"""
    body = json.dumps({
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": "Tu es scénariste de polar et concepteur de jeux d'enquête. Tu fournis uniquement un objet JSON valide et une affaire logique."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.65
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"], "Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=100) as response:
        result = json.load(response)
    return json.loads(result["choices"][0]["message"]["content"])


def main():
    now = dt.datetime.now(PARIS)
    # Scheduled jobs run at 16 and 17 UTC to handle summer/winter time.
    # A manual run is allowed for testing, but only publishes on Friday at 18 Paris time.
    if now.weekday() != 4 or now.hour < 18:
        print("Avant vendredi 18 h Europe/Paris ou hors vendredi : aucune proposition.")
        return
    if not os.getenv("OPENAI_API_KEY"):
        fail("Secret OPENAI_API_KEY manquant : aucune enquête générée.")
    data = json.loads(DEST.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        fail("Le catalogue doit être une liste.")
    case_id = "hebdo-" + now.date().isoformat()
    if any(c.get("id") == case_id for c in data):
        print("Déjà publié cette semaine.")
        return
    previous = ", ".join(c.get("titre", "") for c in data[-12:])
    for attempt in range(1, 4):
        try:
            case = valid_case(request_case(case_id, attempt, previous))
            if case["id"] != case_id:
                fail("ID de semaine incorrect")
            if any(c.get("titre", "").casefold() == case["titre"].casefold() for c in data):
                fail("Titre dupliqué")
            data.append(case)
            DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("Enquête validée et prête à publier :", case_id)
            return
        except (ValueError, KeyError, TypeError) as exc:
            print(f"Tentative {attempt} rejetée : {exc}", file=sys.stderr)
    fail("Aucune enquête n'a passé les contrôles; rien n'est publié.")


if __name__ == "__main__":
    main()
