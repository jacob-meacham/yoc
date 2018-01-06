from models import markov
import json

with open("../corpus/titles.txt") as f:
    text = f.read()

model = markov.build_model(text, True)
model_json = model.to_json()

with open('title_markov_model.json', 'w') as f:
  json.dump(model_json, f, ensure_ascii=False)

# for i in range(200):
#     sentence = model.make_sentence()
#     if sentence:
#         print(sentence)

