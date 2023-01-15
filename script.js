

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
// function getPasswordOptions() {

const getPasswordOptions = async () => {
  let responses = {}; // holds answers to various options (password criteria) presented to user
  let cancel = false; // binding for user Cancel action
  let filteredArr;

  do {
    const result1 = await Swal.fire({
      title: 'Password Length',
      text: 'Select the length of the password (between 10 and 64 characters):',
      input: 'range',
      inputAttributes: {
        min: 10,
        max: 64,
        step: 1
      },
      // confirmButtonText: 'Confirm',
      // cancelButtonText: 'Cancel'
      showCancelButton: true,
      confirmButtonText: `Confirm`,
    });

    if (result1.isDismissed) {   //  Cancel = isDimissed, Yes = isConfirmed
      cancel = true;
    } else if (result1.isConfirmed){
      responses.passwordLength = Number(result1.value);
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

      // get a filtered array of just the true/false values (i.e. omitting pasword length element)
    arr = Object.values(responses);
    filteredArr = arr.filter(x => x === true || x === false);

    if (!cancel && (filteredArr.filter(x => x === true).length == 0)) {
      const result = await Swal.fire({
        title: 'uh-oh!',
        text: 'You must select at least one character type. Try again?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: `Yes`,
      });
      
      if (result.isDismissed) {   //  Cancel = isDimissed, No = isDenied, Yes = isConfirmed
        cancel = true;
      }
    }

  // restart loop if user has not cancelled AND not requested at one least character 
  // type from the options presented
   
  } while (!cancel && (filteredArr.filter(x => x === true).length == 0)) 

  // return object literals
  return {
    cancel: cancel,       // cancel was pressed for any option (different to 'No')
    responses: responses  // responses object
  };
}

async function getUserResponse (title, text) {

  let answers = []; // return array, where answers[0] = cancel, answers[0] = yes (include character type)

  // uses the Swal object to get a reponse from user
  const result = await Swal.fire({
    title: title,
    text: text,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Yes`,
    denyButtonText: `No`,
  });

  answers.push(result.isDismissed); // true = user cancelled
  answers.push(result.isConfirmed); // true = user selected character type
  return answers;

}

// Function for getting a random element from an array
function getRandom(arr) {
  randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

// Function to generate password from user input
function generatePassword(criteria) {
  let char = '';
  let password = '';
  let charTypes = [];

  // generate array of permitted character types i.e: 
  // 'u' = uppercase (if permitted)
  // 'l' = lowercase
  // 'n' = numeric
  // 's' = sepcial characters
  Object.entries(criteria).forEach(([key, value]) => {
    if (key != criteria.passwordLength && value) {
      charTypes.push(key.charAt(0))
    }
  });
  
  // generate the password based on allowable character types
  // and random number generator
  for (; password.length < criteria.passwordLength; password += char) {
    let charType = getRandom(charTypes);
    char = '';
    switch (charType) {
      case 'l':
        char = getRandom(lowerCasedCharacters);
        break;
      case 'u':
        char = getRandom(upperCasedCharacters);
        break;
      case 'n':
        char = getRandom(numericCharacters);
        break;
      case 's':
        char = getRandom(specialCharacters);
    }
  }
  return password;
}

// Get references to the #generate element
var generateBtn = document.querySelector('#generate');

// Write password to the #password input
async function writePassword() {

  let passwordOptions = await getPasswordOptions();

  // unpack the returned values
  let options = passwordOptions.responses;
  let cancelled = passwordOptions.cancel;

  // initialise output variable (show user their selections)
  let output = '';

  Object.entries(options).forEach(function([key, value]) {
    output = output + key.replace("passwordLength", "Password length") + ': ' + value + ", \n";
  });

  // show user their selections before generating the password
  if (!cancelled) {
    Swal.fire(
      'All done!',
      'Your answers: ' + output,
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

// Add event listener to generate button
generateBtn.addEventListener('click', writePassword);



