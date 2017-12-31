from cryptozoo.models import markov

with open("corpus/TableCaptions.txt") as f:
    text = f.read()

model = markov.build_model(text, True)

for i in range(200):
    sentence = model.make_sentence()
    if sentence:
        print(sentence)

