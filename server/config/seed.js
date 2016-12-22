/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var _ = require('lodash');
var async = require('async');


User.count({}, function(err, count) {
  if (count) {
    return;
  }

  var user = new User({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    active: true
  });

  user.save().then(function() {
    return new User({
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin',
      active: true
    }).save();
  }).then(function() {
    console.log('finished populating users');
  });
});


var surveys = [];
surveys.push({
  title: 'K-6 Psychological Distress',
  description: 'The following questions enquire about how you have been feeling over the last four weeks. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how you have been feeling',
  blocks: [
    {
      type: 'radio',
      columns: [
        {title: 'All of the time', score: 1},
        {title: 'Most of the time', score: 2},
        {title: 'Some of the time', score: 3},
        {title: 'A little of the time', score: 4},
        {title: 'None of the time', score: 5}
      ],
      rows: [
        {title: 'In the past 4 weeks, about how often did you feel so sad nothing could cheer you up?'},
        {title: 'In the past 4 weeks, about how often did you feel nervous?'},
        {title: 'In the past 4 weeks, about how often did you feel hopeless?'},
        {title: 'In the past 4 weeks, about how often did you feel restless or fidgety?'},
        {title: 'In the past 4 weeks, about how often did you feel that everything was an effort?'},
        {title: 'In the past 4 weeks, about how often did you feel worthless?'}
      ]
    }
  ]
});


surveys.push({
  title: 'K-10 Psychological Distress',
  description: 'The following questions enquire about how you have been feeling over the last four weeks. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how you have been feeling.',
  blocks: [
    {
      type: 'radio',
      columns: [
        {title: 'All of the time', score: 1},
        {title: 'Most of the time', score: 2},
        {title: 'Some of the time', score: 3},
        {title: 'A little of the time', score: 4},
        {title: 'None of the time', score: 5}
      ],
      rows: [
        {title: 'In the past 4 weeks, about how often did you feel tired out for no good reason?'},
        {title: 'In the past 4 weeks, about how often did you feel nervous?'},
        {title: 'In the past 4 weeks, about how often did you feel so nervous that nothing could calm you down?'},
        {title: 'In the past 4 weeks, about how often did you feel hopeless?'},
        {title: 'In the past 4 weeks, about how often did you feel restless or fidgety?'},
        {title: 'In the past 4 weeks, about how often did you feel so restless you could not sit still?'},
        {title: 'In the past 4 weeks, about how often did you feel depressed?'},
        {title: 'In the past 4 weeks, about how often did you feel that everything was an effort?'},
        {title: 'In the past 4 weeks, about how often did you feel so sad that nothing could cheer you up?'},
        {title: 'In the past 4 weeks, about how often did you feel worthless?'}
      ]
    }
  ]
});


surveys.push({
  title: 'PTSD Check List - 4 (PCL-4)',
  description: 'Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how much you have been bothered by that problem in the past month.',
  blocks: [
    {
      type: 'radio',
      columns: [
        {title: 'Not at all', score: 1},
        {title: 'A little bit', score: 2},
        {title: 'Moderate', score: 3},
        {title: 'Quite a bit', score: 4},
        {title: 'Extreme', score: 5}
      ],
      rows: [
        {title: 'Repeated, disturbing _memories_, _thoughts_, or _images_ of a stressful experience from the past?'},
        {title: 'Having _physical reactions_ (e.g., heart pounding, trouble breathing, or sweating) when _something reminded_ you of a stressful experience from the past?'},
        {title: 'Avoiding _activities_ or _situations_ because _they remind you_ of a stressful experience from the past?'},
        {title: 'Having _difficulty_ concentrating?'}
      ]
    }
  ]
});

surveys.push({
  title: 'PTSD Check List - Civilian (PCL-C)',
  description: 'Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how much you have been bothered by that problem in the past month.',
  blocks: [
    {
      type: 'radio',
      columns: [
        {title: 'Not at all', score: 1},
        {title: 'A little bit', score: 2},
        {title: 'Moderate', score: 3},
        {title: 'Quite a bit', score: 4},
        {title: 'Extreme', score: 5}
      ],
      rows: [
        {title: 'Repeated, disturbing _memories_, _thoughts_, or _images_ of a stressful experience from the past?'},
        {title: 'Repeated, disturbing _dreams_ of a stressful experience from the past?'},
        {title: 'Suddenly _acting_ or _feeling_ as if a stressful experience _were happening again_ (as if you were reliving it)?'},
        {title: 'Feeling _very upset_ when _something reminded_ you of a stressful experience from the past?'},
        {title: 'Having _physical reactions_ (e.g., heart pounding, trouble breathing, or sweating) when _something reminded_ you of a stressful experience from the past?'},
        {title: 'Avoiding thinking about or talking about a stressful experience from the past or avoiding having feelings related to it?'},
        {title: 'Avoiding activities or situations because they remind you of a stressful experience from the past?'},
        {title: 'Trouble remembering important parts of a stressful experience from the past?'},
        {title: 'Loss of interest in things that you used to enjoy?'},
        {title: 'Feeling distant or cut off from other people?'},
        {title: 'Feeling emotionally numb or being unable to have loving feelings for those close to you?'},
        {title: 'Feeling as if your future will somehow be cut short?'},
        {title: 'Trouble falling or staying asleep?'},
        {title: 'Feeling irritable or having angry outbursts?'},
        {title: 'Having difficulty concentrating?'},
        {title: 'Being \'super alert\' or watchful and on guard?'},
        {title: 'Feeling jumpy or easily startled?'}
      ]
    }
  ]
});

var Survey = require('../api/survey/survey.model');

Survey.count().then(function(count) {
  if (!count) {
    Promise.each(surveys, function(survey) {
      return new Survey(survey).save();
    }).then(function() {
      console.log('new surveys successfully imported');
    });
  }
});
