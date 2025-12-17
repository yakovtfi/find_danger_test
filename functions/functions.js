import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://spiestestserver.onrender.com';
const DATA_DIR = './data';
const PEOPLE_FILE = path.join(DATA_DIR, 'PEOPLE.json');
const TRANSCRIPTIONS_FILE = path.join(DATA_DIR, 'TRANSCRIPTIONS.json');


export async function getPeopleList() {
    try {
        console.log('\nFetching people list');
        const response = await fetch(`${BASE_URL}/people`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const textData = await response.text();

        await fs.writeFile(PEOPLE_FILE, textData, 'utf-8');

        console.log(' People list saved to PEOPLE.json');
    } catch (error) {
        console.error('Error fetching people:', error.message);
    }
}


export async function getTranscriptions() {
    try {
        console.log("\n Fetching Transcriptions")
        const response = await fetch(`${BASE_URL}/transcriptions`)


        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const textData = await response.text();

        await fs.writeFile(TRANSCRIPTIONS_FILE, textData, 'utf-8');

        console.log(' Transcriptions saved to TRANSCRIPTIONS.json');
    } catch (error) {
        console.error('Error fetching transcriptions:', error.message);
    }
}

async function loadPeopleData() {
    try {
        const data = await fs.readFile(PEOPLE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading people data.');
        return null;
    }
}


async function loadTranscriptionsData() {
    try {
        const data = await fs.readFile(TRANSCRIPTIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading transcriptions. ).');
        return null;
    }
}
 



export async function searchByName(name) {
    const people = await loadPeopleData()

    if (!people) return;

    const person = people.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (person) {
        console.log('\n Person found:');
        console.log(person);
    } else {
        console.log(`\n Person with name "${name}" was not found.`);
    }
}


export async function searchByAge(age) {
    const people = await loadPeopleData();

    if (!people) return;

    const ageNumber = parseInt(age);

    const person = people.find(p => p.age === ageNumber)

    if (person) {
        console.log('\n Person found:');
        console.log(person);
    } else {
        console.log(`\n Person with age ${age} was not found.`);
    }
}




function calculateDangerLevel(content) {
    const dangerousWords = ['death', 'knife', 'bomb', 'attack'];
    let dangerScore = 0;


    for (let i = 0; i < dangerousWords.length; i++) {
        const word = dangerousWords[i];
        const lowerContent = content.toLowerCase();


        const parts = lowerContent.split(word);
        const count = parts.length - 1;
        dangerScore += count;
    }

    return dangerScore;
}


export async function findDangerousPeople() {
    console.log('\nAnalyzing dangerous people');

    const transcriptions = await loadTranscriptionsData();
    const people = await loadPeopleData();

    if (!transcriptions || !people) return;


    const dangerByAge = {};

    for (let i = 0; i < transcriptions.length; i++) {
        const record = transcriptions[i];
        const dangerLevel = calculateDangerLevel(record.content);

        if (dangerLevel > 0) {
            const age = record.age;


            if (!dangerByAge[age]) {
                dangerByAge[age] = [];
            }


            dangerByAge[age].push(dangerLevel);
        }
    }


    const avgDangerByAge = {};
    const ages = Object.keys(dangerByAge);

    for (let i = 0; i < ages.length; i++) {
        const age = ages[i];
        const scores = dangerByAge[age];


        let sum = 0;
        for (let j = 0; j < scores.length; j++) {
            sum += scores[j];
        }


        const average = sum / scores.length;
        avgDangerByAge[age] = average;
    }


    const agesArray = [];
    for (const age in avgDangerByAge) {
        agesArray.push({
            age: age,
            avgDanger: avgDangerByAge[age]
        });
    }


    agesArray.sort(function (a, b) {
        return b.avgDanger - a.avgDanger;
    });


    const top3Ages = [];
    for (let i = 0; i < 3 && i < agesArray.length; i++) {
        top3Ages.push(agesArray[i]);
    }

    console.log('\nTop 3 Most Dangerous Ages:');
    for (let i = 0; i < top3Ages.length; i++) {
        const age = top3Ages[i].age;
        const avgDanger = top3Ages[i].avgDanger;
        console.log(`${i + 1}. Age ${age}: ${avgDanger.toFixed(2)} avg danger`);
    }


    const topAgesNumbers = [];
    for (let i = 0; i < top3Ages.length; i++) {
        topAgesNumbers.push(parseInt(top3Ages[i].age));
    }

    const dangerousPeople = [];
    for (let i = 0; i < people.length; i++) {
        const person = people[i];


        for (let j = 0; j < topAgesNumbers.length; j++) {
            if (person.age === topAgesNumbers[j]) {
                dangerousPeople.push(person);
                break;
            }
        }
    }

    console.log(`\nFound ${dangerousPeople.length} dangerous people:`);
    for (let i = 0; i < dangerousPeople.length; i++) {
        const person = dangerousPeople[i];
        console.log(`- ${person.name}, Age ${person.age}, ${person.profession}`);
    }


    try {
        const peopleParam = encodeURIComponent(JSON.stringify(dangerousPeople));
        const reportUrl = `${BASE_URL}/report?people=${peopleParam}`;
        const response = await fetch(reportUrl);

        const responseText = await response.text();
        console.log('\nServer Response:');
        console.log(responseText);
    } catch (error) {
        console.error('Error sending report:', error.message);
    }
}