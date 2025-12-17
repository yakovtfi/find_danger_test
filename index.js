import readline from 'readline';
import {
    getPeopleList,
    getTranscriptions,
    searchByName,
    searchByAge,
    findDangerousPeople

} from './functions/functions.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('1. Get People List');
    console.log('2. Get Call Records/Transcriptions');
    console.log('3. Search People by Name');
    console.log('4. Search People by Age');
    console.log('5. Find Dangerous People');
    console.log('0. Exit');

}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    let running = true;

    while (running) {
        showMenu();
        const choice = await question('\nEnter your choice: ');

        switch (choice.trim()) {
            case '1':
                await getPeopleList();
                break;

            case '2':
                await getTranscriptions();
                break;

            case '3':
                const name = await question('Enter name to search: ');
                await searchByName(name.trim());
                break;


            case '4':
                const age = await question('Enter age to search:')
                await searchByAge(age.trim())
                break;

            case '5':
                await findDangerousPeople();
                break;


            case '0':
                console.log('\nExiting system. Goodbye!');
                running = false;
                break;

            default:
                console.log('\nInvalid choice. Please try again.');
        }
    }

    rl.close();
}

main();
