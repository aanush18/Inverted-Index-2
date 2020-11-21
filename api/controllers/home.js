const Paragraph = require('../models/paragraph');
const mongoose = require('mongoose');

exports.home_get = (request, response, next) => {
    response.render('home');
}

exports.home_post = (request, response, next) => {

    try {
        const rawText = request.body.paragraphs;
        var output = rawText.split(/(?:\r\n){2,}/);

        output.forEach(element => {
            const paragraph = new Paragraph({
                text: element,
                tags: element.toLowerCase().split(/\s/g)
            });

            paragraph.save().then().catch(error => {
                return response.status(404).json({
                    message: "Something went wrong",
                    error
                });
            });
        });

        response.status(200).render('home');

    } catch (error) {
        console.log(error);
    }
}

exports.search_get = (request, response, next) => {
    try {

        Paragraph.collection.createIndex({ tags: 'text' });
        response.status(200).render('search', {
            paragraphs: [{
                "text": "Nothing to show here."
            }]
        });
        next();
    } catch (error) {
        console.log(error);
    }
}

exports.search_post = (request, response, next) => {
    try {
        const query = request.body.query;
        Paragraph.find({
            $text: {
                $search: query
            }
        }, {
            score: {
                $meta: 'textScore'
            }
        }).sort({
            score: {
                $meta: 'textScore'
            }
        }).select('_id text').limit(10).exec().
            then(paragraphs => {
                if (paragraphs.length === 0) {
                    response.status(200).render('search', {
                        paragraphs: [{
                            "text": "Not found."
                        }]
                    });
                } else {
                    response.status(200).render('search', {
                        paragraphs: paragraphs
                    });
                }
            }).catch(error => {
                return response.status(404).json({
                    message: "Something went wrong",
                    error
                });
            });
    } catch (error) {
        console.log(error);
    }
}

exports.clear_get = (request, response, next) => {
    try {
        Paragraph.deleteMany({}).exec().then(paragraphs => {
            response.status(200).render('infopage');
        }).catch(error => {
            response.status(404).json({
                message: "Something went wrong",
                error
            });
        });
        Paragraph.collection.drop();
    } catch (error) {
        console.log(error);
    }
}
/*function indexDocuments(req, res, next) {
    input_text = req.query.input_text;
    input_text = input_text.replace(/[^\w\s]|_/g, "")
    console.log(input_text)
    input_text_split = input_text.split("\r\n\r\n");
    i = 1;
    input_text_split.forEach((inp) => {
        docs[i] = input_text_split[i - 1];
        i++;
    })
    console.log("1")
    return next();
}

function indexWords(req, res, next) {
    for (let current_doc_index in docs) {
        current_doc = docs[current_doc_index];
        current_doc_words = current_doc.split(" ");
        current_doc_words.forEach((current_word) => {
            current_word = current_word.toLowerCase();
            if (!(current_word in words)) {
                words[current_word] = [];
            }
            if (words[current_word].indexOf(current_doc_index) == -1) {
                words[current_word].push(current_doc_index);
            }
        });
    }
    // console.log(words)
    return next();
}

function searchWord(req, res, next) {
    search_word = req.query.search_word;
    search_word_indices = words[search_word];
    if (search_word_indices.length > 10) {
        search_word_indices = search_word_indices.slice(0, 10);
    }
    search_word_docs = []
    search_word_indices.forEach((index) => {
        search_word_docs.push(docs[index])
    })
    return next();
}*/
