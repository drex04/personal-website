// Starting from https://www.taniarascia.com/javascript-mvc-todo-app/

class Model {
    constructor() {
        // The state of the model, an array of recipe objects, prepopulated with some test data if nothing else

        if (JSON.parse(localStorage.getItem('recipes'))) {
            this.recipes = JSON.parse(localStorage.getItem('recipes'))
        } else {
            this.recipes = [
                {
                    id: 1,
                    name: "Miso Spaghetti",
                    submitter: "Travis",
                    ingredients: "1 tbsp white miso, 1 package spaghetti, 1 oz parmesan cheese, Some precooked vegetables of your choice, e.g. blanched broccoli, frozen peas, etc., Shredded nori or furikake (optional)",
                    cookingMethod: "Cook the spaghetti, drain, and reserve 1/2 cup pasta water. Stir the miso & parmesan cheese into the hot pasta while adding splashes of starchy pasta water. Toss spaghetti until the cheese is incorporated and fully coats pasta. Add some vegetables if you like. Garnish with shredded nori or furikake.",
                }
            ]
        }

    }

    bindRecipeListChanged(callback) {
        this.onRecipeListChanged = callback
    }

    _commit(recipes) {
        this.onRecipeListChanged(recipes)
        localStorage.setItem('recipes', JSON.stringify(recipes))

        function postRecipe(recipes) {
            // for prod, use fetch('http://www.drewnollsch.com/recipes')
            fetch('http://localhost:80/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(recipes)
            })
                .catch(error => console.log(error))

        }
        
        var newRecipe = recipes.slice(-1)
        postRecipe(newRecipe)

    }

    addRecipe(recipeName, submitterName, ingredients, cookingMethod) {
        const recipe = {
            id: this.recipes.length > 0 ? this.recipes[this.recipes.length - 1].id + 1 : 1,
            name: recipeName,
            submitter: submitterName,
            ingredients: ingredients,
            method: cookingMethod,
        }

        this.recipes.push(recipe)

        this._commit(this.recipes)
    }

    // Map through all recipes, and replace the text of the recipe with the specified id 
    editRecipe(id, updatedText) {
        this.recipes = this.recipes.map((recipe) =>
            recipe.id === id ? { id: recipe.id, text: updatedText } : recipe,
        )

        this._commit(this.recipes)
    }

    // Filter a recipe out of the array by id
    deleteRecipe(id) {
        this.recipes = this.recipes.filter((recipe) => recipe.id !== id)

        this._commit(this.recipes)
    }

}

class View {
    constructor() {
        // The root element
        this.app = this.getElement('#root')

        // The form, with four [type="text"] inputs, and a submit button
        this.form = this.createElement('form')
        //this.form.action = "/recipe-data"
        this.form.method = "POST"


        // input submitter name
        this.inputSubmitterName = this.createElement('input')
        this.inputSubmitterName.type = 'text'
        this.inputSubmitterName.placeholder = 'Enter your name here...'
        this.inputSubmitterName.id = 'submitterName'
        this.inputSubmitterName.name = 'submitterName'
        // label input submitter name
        this.labelInputSubmitterName = this.createElement('label')
        this.labelInputSubmitterName.setAttribute("for", 'submitterName')
        this.labelInputSubmitterName.innerHTML = "your name"

        // input recipe name
        this.inputRecipeName = this.createElement('input')
        this.inputRecipeName.type = 'text'
        this.inputRecipeName.placeholder = 'Enter recipe name here...'
        this.inputRecipeName.id = 'recipeName'
        this.inputRecipeName.name = 'recipeName'
        // label input recipe name
        this.labelInputRecipeName = this.createElement('label')
        this.labelInputRecipeName.setAttribute("for", 'recipeName')
        this.labelInputRecipeName.innerHTML = "recipe name"


        // input ingredients
        this.inputIngredients = this.createElement('textarea')
        this.inputIngredients.rows = '10'
        this.inputIngredients.placeholder = 'Enter recipe ingredients here...'
        this.inputIngredients.id = 'ingredients'
        this.inputIngredients.name = 'ingredients'
        // label input ingredients
        this.labelInputIngredients = this.createElement('label')
        this.labelInputIngredients.setAttribute("for", 'ingredients')
        this.labelInputIngredients.innerHTML = "ingredients"

        // input cooking method
        this.inputCookingMethod = this.createElement('textarea')
        this.inputCookingMethod.rows = '10'
        this.inputCookingMethod.placeholder = 'Enter cooking instructions here...'
        this.inputCookingMethod.id = 'cookingMethod'
        this.inputCookingMethod.name = 'cookingMethod'
        // label input cooking method
        this.labelInputCookingMethod = this.createElement('label')
        this.labelInputCookingMethod.setAttribute("for", 'cookingMethod')
        this.labelInputCookingMethod.innerHTML = "cooking instructions"

        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'submit recipe'

        // The visual representation of the recipe list
        this.recipeList = this.createElement('ul', 'recipe-list')

        // Append the input and submit button to the form
        this.form.append(this.labelInputSubmitterName, this.inputSubmitterName, this.labelInputRecipeName, this.inputRecipeName, this.labelInputIngredients, this.inputIngredients, this.labelInputCookingMethod, this.inputCookingMethod, this.submitButton)

        // Append the title, form, and recipe list to the app
        this.app.append(this.form, this.recipeList)

        // VERSION 2 WITH NESTED OBJECTS
        this.input = {
            recipeName
        }



    }

    // Create an element with an optional CSS class
    createElement(tag, className) {
        const element = document.createElement(tag)
        if (className) element.classList.add(className)

        return element
    }

    // Retrieve an element from the DOM
    getElement(selector) {
        const element = document.querySelector(selector)

        return element
    }

    // get input values
    get _recipeName() {
        return this.inputRecipeName.value
    }
    get _submitterName() {
        return this.inputSubmitterName.value
    }
    get _ingredients() {
        return this.inputIngredients.value
    }
    get _cookingMethod() {
        return this.inputCookingMethod.value
    }

    // reset input values
    _resetRecipeInputs() {
        this.recipeName = ''
        this.submitterName = ''
        this.ingredients = ''
        this.inputCookingMethod.value = ''
    }

    displayRecipes(recipes) {
        // Delete all nodes
        while (this.recipeList.firstChild) {
            this.recipeList.removeChild(this.recipeList.firstChild)
        }

        // Show default message
        if (recipes.length === 0) {
            const p = this.createElement('p')
            p.textContent = 'No recipes have been submitted yet! Would you like to add one?'
            this.recipeList.append(p)
        } else {
            // Create recipe item nodes for each recipe in state
            recipes.forEach(recipe => {
                const li = this.createElement('li', 'nestedRecipe')
                li.id = recipe.id
                // Create sublist to hold recipe name, submitter name, ingredients, method
                const sublistUL = this.createElement('ul')
                li.appendChild(sublistUL)

                // Recipe name & submitter name in the same span
                const sublistRecipeHeader = this.createElement('li', 'recipeHeader')
                sublistUL.appendChild(sublistRecipeHeader)

                const spanRecipeHeader = this.createElement('span')

                // Check whether the submitter name ends in the letter "S" to properly pluralize the header
                if (recipe.submitter === undefined) {
                    recipe.submitter = "someone"
                    if (recipe.name === undefined) {
                        recipe.name = "something"
                    }
                }
                if (recipe.submitter.slice(-1) === "s" || recipe.submitter.slice(-1) === "S") {
                    spanRecipeHeader.textContent = recipe.submitter.toLowerCase() + "' ◆ " + recipe.name.toLowerCase()
                    sublistRecipeHeader.append(spanRecipeHeader)
                }
                else {
                    spanRecipeHeader.textContent = recipe.submitter.toLowerCase() + "'s ◆ " + recipe.name.toLowerCase()
                    sublistRecipeHeader.append(spanRecipeHeader)
                }

                // The recipe ingredients will be in a separate li and span
                const sublistIngredients = this.createElement('li', 'ingredients')
                sublistUL.appendChild(sublistIngredients)

                const spanIngredients = this.createElement('span')
                spanIngredients.textContent = recipe.ingredients
                sublistIngredients.append(spanIngredients)

                // The recipe method will be in a separate li and span
                const sublistCookingMethod = this.createElement('li', 'cookingMethod')
                sublistUL.appendChild(sublistCookingMethod)

                const spanCookingMethod = this.createElement('span')
                spanCookingMethod.textContent = recipe.method
                sublistCookingMethod.append(spanCookingMethod)

                // Append nodes to the recipe list
                this.recipeList.append(li)
            })
        }

        // Debugging
        console.log(recipes)
    }

    bindAddRecipe(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            if (this._recipeName && this._submitterName && this._ingredients && this._cookingMethod) {
                handler(this._recipeName, this._submitterName, this._ingredients, this._cookingMethod)

                this._resetRecipeInputs

            } else {
                alert("Please complete recipe info!")
            }

        })
    }


}

class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view

        // Explicit this binding
        this.model.bindRecipeListChanged(this.onRecipeListChanged)
        this.view.bindAddRecipe(this.handleAddRecipe)

        // Display initial recipes
        this.onRecipeListChanged(this.model.recipes)
    }

    onRecipeListChanged = (recipes) => {
        this.view.displayRecipes(recipes)
    }


    handleAddRecipe = (recipeName, submitterName, ingredients, cookingMethod) => {
        this.model.addRecipe(recipeName, submitterName, ingredients, cookingMethod)

    }

    handleDeleteRecipe = id => {
        this.model.deleteRecipe(id)
    }

}

const app = new Controller(new Model(), new View());

