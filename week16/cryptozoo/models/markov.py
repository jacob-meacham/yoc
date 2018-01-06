import markovify
#import spacy

# TODO: Interface to the model for generating a paper
#nlp = spacy.load("en")


def word_split(sentence):
    #return ["::".join((word.orth_, word.pos_)) for word in nlp(sentence)]
    return None


def word_join(words):
    #sentence = " ".join(word.split("::")[0] for word in words)
    #return sentence
    return None


class PartOfSpeechAwareText(markovify.Text):
    def word_split(self, sentence):
        return word_split(sentence)

    def word_join(self, words):
        return word_join(words)


class PartOfSpeechAwareNewlineText(markovify.NewlineText):
    def word_split(self, sentence):
        return word_split(sentence)

    def word_join(self, words):
        return word_join(words)


def build_model(text, newline_delimited=False):
    if newline_delimited:
        return markovify.NewlineText(text)

    return markovify.Text(text)


def load_model(model_definition):
    return markovify.Text.from_json(model_definition)
