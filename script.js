function updateFlagOptions() {
    const mainCategory = document.getElementById("mainCategory").value;
    const flagDropdown = document.getElementById("flagOptions");

    flagDropdown.innerHTML = '';

    const options = flagCategories[mainCategory];
    
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.name;
        flagDropdown.appendChild(opt);
    });
}

window.onload = function() {
    updateFlagOptions();
};

function checkFlags() {
    const selectedCategory = document.getElementById('flagOptions').value;
    const selectedFlags = flags[selectedCategory];
    const inputFlag = parseInt(document.getElementById('flagInput').value);

    if (isNaN(inputFlag)) {
        alert('Please enter a valid number!');
        return;
    }

    const inputValueDisplay = document.getElementById('inputValueDisplay');
    inputValueDisplay.textContent = `Flags included for bitmask value: ${inputFlag}`;

    const flagsIncluded = selectedFlags.filter(flag => flag.bit !== 0 && Math.floor(inputFlag / flag.bit) % 2 === 1);

    const flagList = document.getElementById('flagList');
    flagList.innerHTML = '';

    const combinedList = document.getElementById('combinedList');
    combinedList.innerHTML = '';

    if (flagsIncluded.length > 0) {
        flagsIncluded.forEach(flag => {
            const listItem = document.createElement('li');
            listItem.textContent = `${flag.bit} - ${flag.name}`;
            flagList.appendChild(listItem);
        });

        document.getElementById('inputValueDisplay').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Create the list of flags in the (flag1 | flag2 | flag3 | flag4) format
        const flagNames = flagsIncluded.map(flag => flag.bit);
        const addFlag = `|${flagNames.join('|')}`;
        const removeFlag = `&~(${flagNames.join('|')})`

        // Display the formatted flags
        const flagHeader = document.createElement('h4');
        flagHeader.textContent = 'Add/Remove the listed flags';
        combinedList.appendChild(flagHeader);
        const flagStringElement = document.createElement('li');
        flagStringElement.textContent = `\`${selectedCategory}\`=\`${selectedCategory}\`${addFlag}`;
        combinedList.appendChild(flagStringElement);
        const removeFlagString = document.createElement('li');
        removeFlagString.textContent = `\`${selectedCategory}\`=\`${selectedCategory}\`${removeFlag}`;
        combinedList.appendChild(removeFlagString);
    } else if (flagsIncluded.length == 0) {
        alert('Value must be greater than 0!');
        return;
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No flags found';
        flagList.appendChild(listItem);
    }
}
