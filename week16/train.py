from cryptozoo.models import markov

with open("corpus/captions.txt") as f:
    text = f.read()

model = markov.build_model(text, True)

for i in xrange(10):
    print(model.make_sentence())

