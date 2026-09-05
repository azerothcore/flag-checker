function updateFlagOptions() {
    const mainCategory = document.getElementById("mainCategory").value;
    const flagDropdown = document.getElementById("flagOptions");

    flagDropdown.innerHTML = '';

    const options = flagCategories[mainCategory];
    
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.name;
        // `column: null` marks a field that is not an OR-able bitmask column.
        if (option.column !== null) {
            opt.dataset.column = option.column || option.value;
        }
        flagDropdown.appendChild(opt);
    });
}

window.onload = function() {
    updateFlagOptions();
};

const immunityCommentFields = {
    SchoolMask:     { prefix: "school", strip: "SPELL_SCHOOL_MASK_" },
    DispelTypeMask: { prefix: "dispel", strip: "DISPEL_" },
    MechanicsMask:  { prefix: "mech",   strip: "MECHANIC_" },
};

// MechanicsMask reaches past 2^32, so masks are handled as BigInt throughout.
function parseBitmask(value) {
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) {
        return null;
    }
    return BigInt(text);
}

function checkFlags() {
    const flagDropdown = document.getElementById('flagOptions');
    const selectedOption = flagDropdown.selectedOptions[0];
    const selectedCategory = flagDropdown.value;
    const selectedFlags = flags[selectedCategory];
    const inputFlag = parseBitmask(document.getElementById('flagInput').value);

    const inputValueDisplay = document.getElementById('inputValueDisplay');
    const flagList = document.getElementById('flagList');
    const combinedList = document.getElementById('combinedList');

    // Drop the previous result before anything can bail out, so a rejected
    // input never leaves a stale list on screen.
    inputValueDisplay.textContent = '';
    flagList.innerHTML = '';
    combinedList.innerHTML = '';

    if (inputFlag === null) {
        alert('Please enter a valid number!');
        return;
    }

    if (inputFlag === 0n) {
        alert('Value must be greater than 0!');
        return;
    }

    inputValueDisplay.textContent = `Flags included for bitmask value: ${inputFlag}`;

    // A flag counts as set only when every one of its bits is present. A few
    // AzerothCore constants cover more than one bit, e.g.
    // SPELL_ATTR0_CU_FORCE_AURA_SAVING = 0x20000800.
    const flagsIncluded = selectedFlags.filter(flag => {
        const bit = BigInt(flag.bit);
        return bit !== 0n && (inputFlag & bit) === bit;
    });

    // Whatever is left over has no name in this category.
    let unknownBits = inputFlag;
    selectedFlags.forEach(flag => { unknownBits &= ~BigInt(flag.bit); });

    if (flagsIncluded.length > 0) {
        flagsIncluded.forEach(flag => {
            const listItem = document.createElement('li');
            listItem.textContent = `${flag.bit} - ${flag.name}`;
            flagList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No flags found';
        flagList.appendChild(listItem);
    }

    if (unknownBits !== 0n) {
        const unknownItem = document.createElement('li');
        unknownItem.textContent = `${unknownBits} - unknown bits (0x${unknownBits.toString(16).toUpperCase()})`;
        flagList.appendChild(unknownItem);
    }

    document.getElementById('inputValueDisplay').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    if (flagsIncluded.length === 0) {
        return;
    }

    const commentField = immunityCommentFields[selectedCategory];

    // Create the list of flags in the (flag1 | flag2 | flag3 | flag4) format
    const flagNames = flagsIncluded.map(flag => flag.bit);
    const addFlag = `|${flagNames.join('|')}`;
    const removeFlag = `&~(${flagNames.join('|')})`

    // Display the formatted flags
    const flagHeader = document.createElement('h4');
    flagHeader.textContent = 'Add/Remove the listed flags';
    combinedList.appendChild(flagHeader);

    // creature_immunities Comment entry, e.g. mech=0x4D02440A(CHARM|DISARM|...)
    if (commentField) {
        const shortNames = flagsIncluded.map(flag =>
            flag.name.startsWith(commentField.strip)
                ? flag.name.slice(commentField.strip.length)
                : flag.name
        );
        const commentEntry = `${commentField.prefix}=0x${inputFlag.toString(16).toUpperCase()}(${shortNames.join('|')})`;
        const commentListItem = document.createElement('li');
        commentListItem.textContent = commentEntry;
        combinedList.appendChild(commentListItem);
    }

    // The dropdown carries the real database column, which is not always the
    // key used to look the flag table up.
    const column = selectedOption ? selectedOption.dataset.column : undefined;
    if (!column) {
        return;
    }

    const flagStringElement = document.createElement('li');
    flagStringElement.textContent = `\`${column}\`=\`${column}\`${addFlag}`;
    combinedList.appendChild(flagStringElement);
    const removeFlagString = document.createElement('li');
    removeFlagString.textContent = `\`${column}\`=\`${column}\`${removeFlag}`;
    combinedList.appendChild(removeFlagString);
}
