import scrapy


class CryptidIndexSpider(scrapy.Spider):
    name = 'cryptid'

    def start_requests(self):
        yield scrapy.Request(url='https://en.wikipedia.org/wiki/List_of_cryptids', callback=self.parse_index)

    def parse_index(self, response):
        for a in response.css('h2 + table td:first-child a'):
            yield response.follow(a, callback=self.parse_cryptid)

    def parse_cryptid(self, response):
        yield {
            'text': ' '.join(response.css('p').extract())
        }
