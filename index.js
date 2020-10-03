const inquirer = require('inquirer');
const fetch = require("node-fetch");
const fs = require('fs');

function dispMenu () {
    var config = fs.readFileSync(`${require("os").homedir()}/conf.json`, 'utf-8');
    var status  = [];

    if (config === '') {
        config = {};
        config.pull_json = {};
        config.date = {};

        for (i = 0; i < 2; i++) 
            status[i] = ' ';

    } else {
        config = JSON.parse(config);
        config.pull_json ? (status[0] = (Object.keys(config.pull_json).length > 0 ? (config.pull_json.status ? '✓' : '✖') : ' ')) : ({}, status[0] = '', config.pull_json = {});  
        config.date ? (status[1] = (Object.keys(config.date).length > 0 ? (config.date.status ?  '✓' : '✖') : ' ')) : ({}, status[1] = ' ', config.date = {}); 
    }
        
    var menu = [
        {
            type: 'list',
            name: 'choice',
            message: 'Hangi islemi yapmak istiyorsunuz?',
            choices: [
                `${status[0]} 1: Pull-Json`,
                `${status[1]} 2: Date`,
                new inquirer.Separator(),
                '  0: Exit'
            ]
        }
    ]

    inquirer.
    prompt(menu)
    .then((answers) => {
        switch (answers.choice.split(' ').pop()) {
            case 'Exit':
                return;
            case 'Pull-Json':
                pullJson(config);
                break;
            case 'Date':
                showDate(config);    
                dispMenu();
                break;
        };
    });
};

function writeStatus (config) {
    fs.writeFileSync(`${require("os").homedir()}/conf.json`, JSON.stringify(config), function (err) {
        if (err) console.log(err);
    });
}

async function pullJson(config) {
    var timeout = loadingAnim(); 
    fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(json => {
        clearInterval(timeout);
        console.log(json);
        config.pull_json.status = true;
        config.pull_json.err = null;
        writeStatus(config);
        dispMenu();
    })
    .catch(error => {
        clearInterval(timeout);
        config.pull_json.status = false;
        config.pull_json.err = error.toString();
        writeStatus(config);
        console.log(error);
        dispMenu();
    })    
}

function showDate(config) {
    console.log(new Date());
    config.date.status = true;
    config.date.err = null;
    writeStatus(config);
}

function loadingAnim() {
    process.stdout.write("  Installing");
    var P = ["\\", "|", "/", "-"], x = 0;
    return setInterval(() => {
      process.stdout.write("\r" + P[x++]);
      x &= 3;
    }, 270);
}

dispMenu();