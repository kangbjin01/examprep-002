#!/usr/bin/env python3
"""
Upload extracted SAT questions (JSONL + answer key) to PocketBase.
Usage: python3 scripts/upload-sat-jsonl.py <questions.jsonl> <answer-key.json> <exam-set-name>
"""
import sys, os, json, urllib.request, urllib.error

PB_URL = os.environ.get("POCKETBASE_URL", "http://127.0.0.1:8090")
PB_EMAIL = os.environ.get("PB_ADMIN_EMAIL", "admin@test.com")
PB_PASS = os.environ.get("PB_ADMIN_PASS", "Pass1234!")

def get_token():
    data = json.dumps({"identity": PB_EMAIL, "password": PB_PASS}).encode()
    req = urllib.request.Request(
        f"{PB_URL}/api/collections/_superusers/auth-with-password",
        data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["token"]

def upload(questions, token):
    success = errors = 0
    for q in questions:
        data = json.dumps(q).encode()
        req = urllib.request.Request(
            f"{PB_URL}/api/collections/questions/records",
            data=data,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
            method="POST"
        )
        try:
            urllib.request.urlopen(req)
            success += 1
        except urllib.error.HTTPError as e:
            errors += 1
            print(f"  Error Q{q.get('questionNumber','?')}: {e.code} - {e.read().decode()[:150]}")
    return success, errors

def main():
    if len(sys.argv) < 4:
        print("Usage: python3 upload-sat-jsonl.py <questions.jsonl> <answer-key.json> <exam-set>")
        sys.exit(1)

    jsonl_path = sys.argv[1]
    answers_path = sys.argv[2]
    exam_set = sys.argv[3]

    # Load answers
    with open(answers_path) as f:
        answer_data = json.load(f)

    # Load questions
    questions = []
    global_num = 0
    with open(jsonl_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            q = json.loads(line)
            global_num += 1
            module = q["module"]
            number = str(q["number"])

            # Look up answer
            module_key = f"module{module}"
            answer_letter = answer_data.get(module_key, {}).get(number, "")
            answer_idx = ord(answer_letter) - ord("A") if answer_letter else -1

            questions.append({
                "exam": "sat",
                "section": "reading-writing",
                "type": f"s1m{module}",
                "difficulty": "medium",
                "passage": q.get("passage", ""),
                "question": q.get("question", ""),
                "choices": q.get("choices", []),
                "answer": answer_idx,
                "explanation": "",
                "tags": ["sat", exam_set, f"m{module}"],
                "examSet": exam_set,
                "questionNumber": global_num,
            })

    print(f"Loaded {len(questions)} questions with answers from {exam_set}")

    token = get_token()
    success, errors = upload(questions, token)
    print(f"Uploaded: {success} success, {errors} errors")

if __name__ == "__main__":
    main()
