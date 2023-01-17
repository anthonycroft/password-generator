

// Array of special characters to be included in password
var specialCharacters = [
  '@',
  '%',
  '+',
  '\\',
  '/',
  "'",
  '!',
  '#',
  '$',
  '^',
  '?',
  ':',
  ',',
  ')',
  '(',
  '}',
  '{',
  ']',
  '[',
  '~',
  '-',
  '_',
  '.'
];

// Array of numeric characters to be included in password
var numericCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Array of lowercase characters to be included in password
var lowerCasedCharacters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z'
];

// Array of uppercase characters to be included in password
var upperCasedCharacters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

// Function to prompt user for password options
const getPasswordOptions = async () => {
  let responses = {}; // holds user responses
  let cancel = false; // binding for user Cancel action
  let filteredArr; // sub-set of responses that holds true/false values

  do {
    const result = await Swal.fire({
      title: 'Password Length',
      text: 'Select the length of the password (between 10 and 64 characters):',
      input: 'range',
      icon: 'question',
      inputAttributes: {
        min: 10,
        max: 64,
        step: 1
      },
      inputValue: 15,
      showCancelButton: true,
      confirmButtonText: `Confirm`,
    });

    if (result.isDismissed) {   //  Cancel = isDimissed, Yes = isConfirmed
      cancel = true;
    } else if (result.isConfirmed){
      responses.passwordLength = Number(result.value);
    }

    if (!cancel) {
      const answers = await getUserResponse (
        'Lowercase Characters',
        'Do you want to include lowercase letters?',
      )
      cancel = answers[0];
      responses.lowercase = answers[1];
    }
    
    if (!cancel) {
      const answers = await getUserResponse (
        'Uppercase Characters',
        'Do you want to include uppercase letters?',
      )
      cancel = answers[0];
      responses.uppercase = answers[1];
    }

    if (!cancel) {
      const answers = await getUserResponse (
        'Numbers',
        'Do you want to include numbers?',
      )
      cancel = answers[0];
      responses.numeric = answers[1];
    }
    
    if (!cancel) {
      const answers = await getUserResponse (
        'Special Characters',
        'Do you want to include special characters ($@%&*, etc)?',
      )
      cancel = answers[0];
      responses.special = answers[1];
    }

      // get a filtered array of just the true/false values (i.e. omitting password length element)
    arr = Object.values(responses);
    filteredArr = arr.filter(x => x === true || x === false);

    if (!cancel && (filteredArr.filter(x => x === true).length == 0)) {
      const result = await Swal.fire({
        title: 'uh-oh!',
        text: 'You must select at least one character type. Try again?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes`,
      });
      
      if (result.isDismissed) {   //  Cancel = isDimissed, No = isDenied, Yes = isConfirmed
        cancel = true;
      }
    }

  // restart loop if user has not cancelled AND not requested at one least character type
  } while (!cancel && (filteredArr.filter(x => x === true).length == 0)) 

  // return object literals
  return {
    cancel: cancel,       // cancel action
    responses: responses  // responses object
  };
}

async function getUserResponse (title, text) {

  let answers = []; // return array, where answers[0] = cancel action, answers[1] = true/false (include character type)

  // use the Swal object to get a reponse from user
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,  
    customClass: {
      actions: 'my-actions',
      cancelButton: 'order-1 right-gap',
      confirmButton: 'order-2',
      denyButton: 'order-3',
    },
  });

  answers.push(result.isDismissed); // user cancelled ?
  answers.push(result.isConfirmed); // user selected character type ?
  return answers;

}

// Function for getting a random element from an array
function getRandom(arr) {
  randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Function to generate password from user input
function generatePassword(criteria) {
  let password = ''; // binding for password
  let possibleCharacters = []; // binding for generated array of selectable characters

  Object.entries(criteria).forEach(([key, value]) => {
    if (key != criteria.passwordLength && value) {
      switch (key) {
        case 'lowercase':
          possibleCharacters = possibleCharacters.concat(lowerCasedCharacters);
          break;
        case 'uppercase':
          possibleCharacters = possibleCharacters.concat(upperCasedCharacters);
          break;
        case 'numeric':
          possibleCharacters = possibleCharacters.concat(numericCharacters);
          break;
        case 'special':
          possibleCharacters = possibleCharacters.concat(specialCharacters);
      }
    }
  });

  // generate the password based on selected character types
  for (let index = 0; index < criteria.passwordLength; index++) {
    password = password + getRandom(possibleCharacters);
  }
  return password;
}

// Write password to the #password input
async function writePassword() {

  let passwordOptions = await getPasswordOptions();

  // unpack the returned values
  let options = passwordOptions.responses;
  let cancelled = passwordOptions.cancel;

  // initialise output variable (show user their selections)
  let output = '';

  Object.entries(options).forEach(function([key, value]) {
    if (value==true){value = "yes"};
    if (value==false){value = "no"};
    output = output + key.replace("passwordLength", "Password length") + ': ' + value + ", ";
  });

  // remove last ', '
  output = output.slice(0,-2);

  // show user their selections before generating the password
  if (!cancelled) {
    Swal.fire(
      'All done!',
      'Your selections: ' + output,
      'success'
    )

    // we should have a sensible array of values at this point
    // so generate password
    var password = generatePassword(options);
    var passwordText = document.querySelector('#password');
    passwordText.value = password;

    // handle user Cancel action
  } else {
    Swal.fire(
    'You cancelled!',
    'Sorry we could not help you today.',
    'info'
    )
  }
}

// Get references to the #generate element
var generateBtn = document.querySelector('#generate');

// Add event listener to generate button
generateBtn.addEventListener('click', writePassword);

