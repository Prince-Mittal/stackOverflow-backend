const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const  passport = require('passport');

//Load Person model
const Person = require('../../models/Person');

//Load Profile Model
const Profile = require('../../models/Profile');

//Load Question Models
const Question = require('../../models/Question');

// @type    GET
// @route   /api/questions
// @desc    route for getting all questions
// @access  PUBLIC
router.get('/', (req , res) => {
    Question.find()
        .sort({ date: 'desc' })
        .then(questions => res.json(questions))
        .catch(err=>res.json({noQuestions: "No question to display."}));
});


// @type    POST
// @route   /api/questions/
// @desc    route for submitting questions
// @access  PRIVATE

router.post('/', passport.authenticate('jwt', {session:false}), (req,res) => {
    const newQuestion = new Question({
        textone: req.body.textone,
        texttwo: req.body.texttwo,
        user: req.user.id,
        name: req.body.name,
    });
    newQuestion.save()
        .then(question => res.json(question))
        .catch(err=>console.log(`Unable to push question ${err}`));
});

// @type    POST
// @route   /api/questions/answers/:id
// @desc    route for submitting answers to questions
// @access  PRIVATE

router.post('/answers/:id', passport.authenticate('jwt',{session:false}), (req,res)=>{
    Question.findById(req.params.id)
        .then( question => {
            const newAnswer = {
                user: req.user.id,
                name: req.body.name,
                answer: req.body.answer
            };
            question.answers.unshift(newAnswer);

            question.save()
            .then(question => res.json(question))
            .catch(err=>console.log(err));
        })
        .catch(err => console.log(err));
});

// @type    POST
// @route   /api/questions/upvote/:id
// @desc    route for upvoting the questions
// @access  PRIVATE
router.post('/upvote/:id', passport.authenticate('jwt',{session:false}), (req,res) => {
    Profile.findOne({user:req.user.id})
    .then( profile => {
        Question.findById(req.params.id)
            .then(question => {
                if(question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) {
                    return res.status(400).json({noupvote: 'user already upvoted'});
                }
                question.upvotes.unshift({ user: req.user.id });
                question.save()
                    .then(question => res.json(question))
                    .catch(err=>console.log(err));
            })
            .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

module.exports = router;