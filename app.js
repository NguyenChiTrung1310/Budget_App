// Create 3 Modules
// UI Controller: update and display UI
// Budget Controller: handle events and data
// Controller

//UI Controller (independent)
var UIController = (function () {
    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: document.querySelector(DOMstring.inputValue).value
            }
        },

        getDOMstring: function () {
            return DOMstring;
        }
    }
})();



// Budget Controller (independent)
var budgetController = (function () {

})();



// Controller (connect 2 modules)
var controller = (function (budgetCtrl, UICtrl) {


    var DOM = UICtrl.getDOMstring(); // DOM id input


    var addItem = function () { // get input value function
        var input = UICtrl.getInput();
        console.log(input);
    }



    document.querySelector(DOM.inputBtn).addEventListener('click', addItem); // Handle event button click


    document.addEventListener('keypress', function (event) { // Handle event button press
        if (event.keyCode === 13 || event.which === 13) // property 'which' use for old browser
        {
            addItem();
        }
    });

})(budgetController, UIController);