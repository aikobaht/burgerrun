import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  // Burgers
  {
    id: 'hamburger',
    name: 'Hamburger',
    category: 'Burgers',
    description: 'Our classic burger with lettuce, tomato, onion, and spread',
    customizationOptions: [
      {
        type: 'patty_count',
        label: 'Number of Patties',
        options: ['1', '2', '3', '4'],
        default: '1',
      },
      {
        type: 'cheese',
        label: 'Add Cheese',
        options: ['No Cheese', 'Add Cheese'],
        default: 'No Cheese',
      },
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'pickles',
        label: 'Pickles',
        options: ['No Pickles', 'Add Pickles'],
        default: 'No Pickles',
      },
      {
        type: 'mustard',
        label: 'Mustard',
        options: ['No Mustard', 'Mustard Instead of Spread'],
        default: 'No Mustard',
      },
      {
        type: 'ketchup',
        label: 'Ketchup',
        options: ['No Ketchup', 'Add Ketchup'],
        default: 'No Ketchup',
      },
    ],
  },
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    category: 'Burgers',
    description: 'Our classic burger with cheese',
    customizationOptions: [
      {
        type: 'patty_count',
        label: 'Number of Patties',
        options: ['1', '2', '3', '4'],
        default: '1',
      },
      {
        type: 'cheese_slices',
        label: 'Cheese Slices',
        options: ['1', '2', '3', '4'],
        default: '1',
      },
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'pickles',
        label: 'Pickles',
        options: ['No Pickles', 'Add Pickles'],
        default: 'No Pickles',
      },
      {
        type: 'mustard',
        label: 'Mustard',
        options: ['No Mustard', 'Mustard Instead of Spread'],
        default: 'No Mustard',
      },
      {
        type: 'ketchup',
        label: 'Ketchup',
        options: ['No Ketchup', 'Add Ketchup'],
        default: 'No Ketchup',
      },
    ],
  },
  {
    id: 'double-double',
    name: 'Double-Double',
    category: 'Burgers',
    description: 'Two beef patties, two slices of cheese',
    customizationOptions: [
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'pickles',
        label: 'Pickles',
        options: ['No Pickles', 'Add Pickles'],
        default: 'Add Pickles',
      },
      {
        type: 'mustard',
        label: 'Mustard',
        options: ['No Mustard', 'Mustard Instead of Spread'],
        default: 'No Mustard',
      },
      {
        type: 'ketchup',
        label: 'Ketchup',
        options: ['No Ketchup', 'Add Ketchup'],
        default: 'No Ketchup',
      },
    ],
  },

  // Secret Menu Burgers
  {
    id: 'animal-style',
    name: 'Animal Style Burger',
    category: 'Burgers',
    description: 'Mustard-cooked patty, pickles, grilled onions, extra spread',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'patty_count',
        label: 'Number of Patties',
        options: ['1', '2', '3', '4'],
        default: '1',
      },
      {
        type: 'cheese',
        label: 'Cheese',
        options: ['No Cheese', 'Add Cheese', 'Extra Cheese'],
        default: 'Add Cheese',
      },
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
    ],
  },
  {
    id: '3x3',
    name: '3x3',
    category: 'Burgers',
    description: 'Three beef patties, three slices of cheese',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'animal_style',
        label: 'Animal Style',
        options: ['Regular', 'Animal Style'],
        default: 'Regular',
      },
    ],
  },
  {
    id: '4x4',
    name: '4x4',
    category: 'Burgers',
    description: 'Four beef patties, four slices of cheese',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'animal_style',
        label: 'Animal Style',
        options: ['Regular', 'Animal Style'],
        default: 'Regular',
      },
    ],
  },
  {
    id: 'protein-style',
    name: 'Protein Style Burger',
    category: 'Burgers',
    description: 'Lettuce wrap instead of bun',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'patty_count',
        label: 'Number of Patties',
        options: ['1', '2', '3', '4'],
        default: '1',
      },
      {
        type: 'cheese',
        label: 'Cheese',
        options: ['No Cheese', 'Add Cheese', 'Extra Cheese'],
        default: 'Add Cheese',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'Whole Grilled Onion', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
      {
        type: 'animal_style',
        label: 'Animal Style',
        options: ['Regular', 'Animal Style'],
        default: 'Regular',
      },
    ],
  },
  {
    id: 'flying-dutchman',
    name: 'Flying Dutchman',
    category: 'Burgers',
    description: 'Two patties, two slices of cheese, no bun, no veggies',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'patty_count',
        label: 'Number of Patties',
        options: ['2', '3', '4'],
        default: '2',
      },
      {
        type: 'onion',
        label: 'Add Onion',
        options: ['No Onion', 'Raw Onion', 'Grilled Onions'],
        default: 'No Onion',
      },
    ],
  },
  {
    id: 'grilled-cheese',
    name: 'Grilled Cheese',
    category: 'Burgers',
    description: 'All the fixings, no patty',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'cheese_slices',
        label: 'Cheese Slices',
        options: ['1', '2', '3'],
        default: '2',
      },
      {
        type: 'lettuce',
        label: 'Lettuce',
        options: ['Regular', 'Extra', 'No Lettuce'],
        default: 'Regular',
      },
      {
        type: 'tomato',
        label: 'Tomato',
        options: ['Regular', 'Extra', 'No Tomato'],
        default: 'Regular',
      },
      {
        type: 'onion',
        label: 'Onion',
        options: ['Regular', 'Extra', 'Grilled Onions', 'No Onion'],
        default: 'Regular',
      },
      {
        type: 'spread',
        label: 'Spread',
        options: ['Regular', 'Extra Spread', 'Light Spread', 'No Spread'],
        default: 'Regular',
      },
    ],
  },

  // Fries
  {
    id: 'fries',
    name: 'French Fries',
    category: 'Fries',
    description: 'Fresh-cut fries',
    customizationOptions: [
      {
        type: 'size',
        label: 'Size',
        options: ['Regular', 'Large'],
        default: 'Regular',
      },
      {
        type: 'style',
        label: 'Style',
        options: ['Regular', 'Well-Done', 'Light'],
        default: 'Regular',
      },
    ],
  },
  {
    id: 'animal-fries',
    name: 'Animal Style Fries',
    category: 'Fries',
    description: 'Fries with cheese, spread, and grilled onions',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'size',
        label: 'Size',
        options: ['Regular', 'Large'],
        default: 'Regular',
      },
      {
        type: 'style',
        label: 'Fry Style',
        options: ['Regular', 'Well-Done', 'Light'],
        default: 'Regular',
      },
    ],
  },
  {
    id: 'cheese-fries',
    name: 'Cheese Fries',
    category: 'Fries',
    description: 'Fries with melted cheese',
    isSecretMenu: true,
    customizationOptions: [
      {
        type: 'size',
        label: 'Size',
        options: ['Regular', 'Large'],
        default: 'Regular',
      },
      {
        type: 'style',
        label: 'Fry Style',
        options: ['Regular', 'Well-Done', 'Light'],
        default: 'Regular',
      },
    ],
  },

  // Drinks
  {
    id: 'fountain-drink',
    name: 'Fountain Drink',
    category: 'Drinks',
    customizationOptions: [
      {
        type: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        default: 'Medium',
      },
      {
        type: 'flavor',
        label: 'Flavor',
        options: ['Coke', 'Diet Coke', 'Sprite', 'Dr Pepper', 'Root Beer', 'Lemonade', 'Iced Tea', 'Milk'],
        default: 'Coke',
      },
    ],
  },
  {
    id: 'shake',
    name: 'Shake',
    category: 'Shakes',
    customizationOptions: [
      {
        type: 'flavor',
        label: 'Flavor',
        options: ['Chocolate', 'Vanilla', 'Strawberry'],
        default: 'Chocolate',
      },
    ],
  },
  {
    id: 'neapolitan-shake',
    name: 'Neapolitan Shake',
    category: 'Shakes',
    description: 'All three flavors mixed',
    isSecretMenu: true,
    customizationOptions: [],
  },

  // Coffee
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'Drinks',
    customizationOptions: [
      {
        type: 'size',
        label: 'Size',
        options: ['Small', 'Medium', 'Large'],
        default: 'Medium',
      },
    ],
  },
];

export const categories = [
  'Burgers',
  'Fries',
  'Drinks',
  'Shakes',
];

export const getMenuItemsByCategory = (category: string) => {
  return menuItems.filter((item) => item.category === category);
};

export const getSecretMenuItems = () => {
  return menuItems.filter((item) => item.isSecretMenu);
};

export const getMenuItem = (id: string) => {
  return menuItems.find((item) => item.id === id);
};
