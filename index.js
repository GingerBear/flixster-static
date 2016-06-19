var Request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');

var remote = 'http://www.flixster.com';
var userAgent = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/30.0.1599.69',
  'Safari/537.36'
].join(' ');

var defaultRequestHeaders = {
  'User-Agent'      : userAgent,
  'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Charset'  : 'utf-8;q=0.7,ISO-8859-1;q=0.4,*;q=0.3',
  'Accept-Language' : 'en-US,en;q=0.8',
  'Cache-Control'   : 'no-cache',
  'Pragma'          : 'no-cache',
  'Connection'      : 'keep-alive'
};

var request = Request.defaults({
  headers: defaultRequestHeaders
});

request.get(remote + '/', (err, response, body) => {
  var $ = cheerio.load(body);
  var sections = [
    {
      el: '[data-id="carousel_0"]',
      title: 'Open This Week'
    }, {
      el: '[data-id="carousel_1"]',
      title: 'Top Box Office'
    }, {
      el: '[data-id="carousel_2"]',
      title: 'Upcoming Movies'
    }
  ];

  sections.forEach(section => {
    section.items = parseSection(section, $);
    delete section.el;
  });

  async.each(sections, requestSection, (err) => {
    if (err) {
      console.log('ERROR', err);
      return process.exit(1);
    }

    var now = new Date().getTime();
    var json = {
      sections: sections,
      lastUpdateTime: now
    };

    fs.writeFileSync('./build/data.json', JSON.stringify(json));
    console.log('DONE');
    return process.exit(0);
  });
});

function parseSection(section, $) {
  return $(section.el).find('.carousel-item').map((index, item) => ({
    title: $(item).find('.movie-title').text(),
    poster: $(item).find('.poster').attr('src'),
    href: $(item).find('[href]').attr('href')
  })).get();
}

function requestSection(section, cb) {
  return async.eachSeries(section.items, requestItem, cb);
}

function requestItem(item, cb) {
  console.log('requesting ', remote + item.href);

  return request.get(remote + item.href, (err, response, body) => {
    if (err) return cb(err);

    var $ = cheerio.load(body);

    item.releaseDate = $('.attributes .release-date').eq(0).find('.value').text().trim();
    item.scores = $('.rating-and-trailer .score').map((index, score) => {
      return {
        type: getType($(score).find('i').attr('class')),
        value: $(score).text().trim()
      }
    }).get();

    return cb();
  });
};

function getType(icons) {
  if (icons.indexOf('fresh') > -1) {
    return 'tomato-fresh';
  }

  if (icons.indexOf('certified') > -1) {
    return 'tomato-certified';
  }

  if (icons.indexOf('rotten') > -1) {
    return 'tomato-rotten';
  }

  if (icons.indexOf('spilled') > -1) {
    return 'popcorn-spilled';
  }

  if (icons.indexOf('popcorn') > -1) {
    return 'popcorn-full';
  }

  if (icons.indexOf('icon-wts') > -1) {
    return 'want-to-see';
  }
}