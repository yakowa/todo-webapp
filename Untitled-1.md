![JacobEM](https://jacobem.com/assets/media/JacobEM.png)


# Eating Events

Eating Events is a great way to track your meals and water intake daily! Helpful for people who are on a diet but who need a little help remebering when!

![Version: 2.5.0](https://img.shields.io/badge/Version-2.5.0-00e0a7)

![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC--BY--SA-776bff)

## Documentation

### Setting your wake-up time

By setting the time you woke up today, the times for each of your meals will be automatically generated!

Simply enter the time in the wake up time input field.

**Note:** Must be a number, **not** special formats like 8:30. **Instead**, please use 8.30.

### Setting a meal as completed

To make a meal as completed or 'done', just click the ✓ button on the meal you would like to set as completed.

### Resetting all meals

To reset the completed or 'done' attribute of all meals in a day, simply click the "Reset Today's Meals" button, located above the meals list.

### Removing an item

Simply click X on the item you want to remove!

### Changing themes

Locate the `Go Dark` button to change to dark mode, once in dark mode, you will notice the button was replaced with `Go Light`, clicking this again will swap you to light mode.


## Coming Soon

- Colours Tags
- Multiple Lists

## What did I learn

This was my first project using <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer" class="al-link al-link-focus">Svelte</a> so I learned a lot on how to build apps with it.

After using Svelte I am super impressed and love it very much.

I also learned a lot about how to keep more complicated values (such as Objects or Lists) in local storage. My solution: convert the object into a JSON string then store that string. When you want the value back, simply use the built-in JSON decoding function.