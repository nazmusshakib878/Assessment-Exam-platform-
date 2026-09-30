<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->questions() as $question) {
            Question::updateOrCreate(['text' => $question['text']], $question);
        }
    }

    /** @return array<int, array{text: string, level: int, options: array<int, string>, correct_option: int}> */
    private function questions(): array
    {
        return [
            ['text' => 'Which number comes next: 2, 4, 6, 8, ...?', 'level' => 1, 'options' => ['9', '10', '11', '12'], 'correct_option' => 1],
            ['text' => 'What is the capital city of France?', 'level' => 1, 'options' => ['Paris', 'Rome', 'Madrid', 'Berlin'], 'correct_option' => 0],
            ['text' => 'Which word is a verb?', 'level' => 1, 'options' => ['Happy', 'Run', 'Blue', 'Table'], 'correct_option' => 1],
            ['text' => 'How many days are in one week?', 'level' => 1, 'options' => ['5', '6', '7', '8'], 'correct_option' => 2],
            ['text' => 'Which shape has three sides?', 'level' => 1, 'options' => ['Square', 'Circle', 'Rectangle', 'Triangle'], 'correct_option' => 3],
            ['text' => 'What color do blue and yellow make when mixed?', 'level' => 1, 'options' => ['Green', 'Purple', 'Orange', 'Red'], 'correct_option' => 0],
            ['text' => 'Which animal is known for barking?', 'level' => 1, 'options' => ['Cat', 'Dog', 'Horse', 'Fish'], 'correct_option' => 1],
            ['text' => 'What is 5 + 3?', 'level' => 1, 'options' => ['6', '7', '8', '9'], 'correct_option' => 2],
            ['text' => 'Which season follows spring?', 'level' => 1, 'options' => ['Summer', 'Winter', 'Autumn', 'Rainy'], 'correct_option' => 0],
            ['text' => 'Which object is used to tell time?', 'level' => 1, 'options' => ['Clock', 'Spoon', 'Book', 'Pillow'], 'correct_option' => 0],

            ['text' => 'What is 15% of 200?', 'level' => 2, 'options' => ['20', '25', '30', '35'], 'correct_option' => 2],
            ['text' => 'Which planet is closest to the Sun?', 'level' => 2, 'options' => ['Venus', 'Mercury', 'Earth', 'Mars'], 'correct_option' => 1],
            ['text' => 'Choose the correctly spelled word.', 'level' => 2, 'options' => ['Definately', 'Definetely', 'Definitely', 'Definatly'], 'correct_option' => 2],
            ['text' => 'A rectangle is 8 cm long and 3 cm wide. What is its area?', 'level' => 2, 'options' => ['11 cm', '16 cm', '22 cm', '24 cm'], 'correct_option' => 3],
            ['text' => 'Which gas do plants primarily absorb from the air?', 'level' => 2, 'options' => ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], 'correct_option' => 1],
            ['text' => 'What is the past tense of go?', 'level' => 2, 'options' => ['Goed', 'Gone', 'Went', 'Going'], 'correct_option' => 2],
            ['text' => 'Which fraction is equivalent to 0.5?', 'level' => 2, 'options' => ['1/4', '1/2', '2/3', '3/4'], 'correct_option' => 1],
            ['text' => 'Which organ pumps blood around the body?', 'level' => 2, 'options' => ['Lung', 'Brain', 'Heart', 'Stomach'], 'correct_option' => 2],
            ['text' => 'What is the main purpose of a map legend?', 'level' => 2, 'options' => ['Show distance', 'Explain symbols', 'Name countries', 'Predict weather'], 'correct_option' => 1],
            ['text' => 'If a train leaves at 9:00 and travels for 2 hours, when does it arrive?', 'level' => 2, 'options' => ['10:00', '10:30', '11:00', '12:00'], 'correct_option' => 2],

            ['text' => 'Solve: 3x + 5 = 20.', 'level' => 3, 'options' => ['x = 3', 'x = 5', 'x = 7', 'x = 15'], 'correct_option' => 1],
            ['text' => 'Which layer of Earth is liquid and surrounds the inner core?', 'level' => 3, 'options' => ['Crust', 'Mantle', 'Outer core', 'Lithosphere'], 'correct_option' => 2],
            ['text' => 'What does the idiom break the ice mean?', 'level' => 3, 'options' => ['Start a friendly conversation', 'Damage something cold', 'End an argument', 'Feel very nervous'], 'correct_option' => 0],
            ['text' => 'Which is a renewable energy source?', 'level' => 3, 'options' => ['Coal', 'Natural gas', 'Solar power', 'Diesel'], 'correct_option' => 2],
            ['text' => 'What is the median of 3, 7, 9, 11, 15?', 'level' => 3, 'options' => ['7', '8', '9', '11'], 'correct_option' => 2],
            ['text' => 'Which sentence uses a semicolon correctly?', 'level' => 3, 'options' => ['I studied; and I passed.', 'I studied hard; I passed the exam.', 'I; studied hard.', 'Because I studied; I passed.'], 'correct_option' => 1],
            ['text' => 'In a food chain, what is a producer?', 'level' => 3, 'options' => ['An animal that eats plants', 'A plant that makes food', 'A decomposer', 'A top predator'], 'correct_option' => 1],
            ['text' => 'A shop discounts a $80 item by 25%. What is the sale price?', 'level' => 3, 'options' => ['$20', '$55', '$60', '$65'], 'correct_option' => 2],
            ['text' => 'Which event occurred first?', 'level' => 3, 'options' => ['World War II', 'The French Revolution', 'The moon landing', 'The invention of the internet'], 'correct_option' => 1],
            ['text' => 'What is the best summary of a paragraph?', 'level' => 3, 'options' => ['Every detail copied exactly', 'The main idea in fewer words', 'Only the first sentence', 'A personal opinion'], 'correct_option' => 1],

            ['text' => 'If f(x) = 2x - 3, what is f(4)?', 'level' => 4, 'options' => ['13', '29', '32', '35'], 'correct_option' => 1],
            ['text' => 'Which process converts glucose into usable cellular energy?', 'level' => 4, 'options' => ['Photosynthesis', 'Respiration', 'Transpiration', 'Pollination'], 'correct_option' => 1],
            ['text' => 'Which argument is logically valid?', 'level' => 4, 'options' => ['All mammals breathe air. A whale is a mammal. Therefore, a whale breathes air.', 'If it rains, streets get wet. Streets are wet, so it rained.', 'Some birds fly. A penguin is a bird. Therefore, penguins fly.', 'All squares are rectangles. A rectangle is a square.'], 'correct_option' => 0],
            ['text' => 'What is the slope of a line through (2, 3) and (6, 11)?', 'level' => 4, 'options' => ['1', '2', '3', '4'], 'correct_option' => 1],
            ['text' => 'Which literary device gives human traits to nonhuman things?', 'level' => 4, 'options' => ['Alliteration', 'Hyperbole', 'Personification', 'Onomatopoeia'], 'correct_option' => 2],
            ['text' => 'What is the pH of a neutral solution at room temperature?', 'level' => 4, 'options' => ['0', '5', '7', '14'], 'correct_option' => 2],
            ['text' => 'A population doubles every 3 hours. Starting with 50, how many are there after 9 hours?', 'level' => 4, 'options' => ['200', '300', '400', '450'], 'correct_option' => 2],
            ['text' => 'Which policy is most likely to reduce inflation by lowering demand?', 'level' => 4, 'options' => ['Lower interest rates', 'Raise interest rates', 'Increase government spending', 'Reduce taxes'], 'correct_option' => 1],
            ['text' => 'Which sentence has parallel structure?', 'level' => 4, 'options' => ['She likes running, to swim, and biking.', 'She likes to run, swim, and bike.', 'She likes running, swimming, and to bike.', 'She likes to run, swimming, and bike.'], 'correct_option' => 1],
            ['text' => 'What is the probability of drawing a heart from a standard 52-card deck?', 'level' => 4, 'options' => ['1/2', '1/4', '1/13', '4/13'], 'correct_option' => 1],

            ['text' => 'Solve for x: log10(x) = 3.', 'level' => 5, 'options' => ['30', '100', '300', '1000'], 'correct_option' => 3],
            ['text' => 'Which statement best describes natural selection?', 'level' => 5, 'options' => ['Organisms choose useful traits.', 'Individuals with advantageous heritable traits tend to leave more offspring.', 'All organisms evolve at the same rate.', 'Evolution happens within one lifetime.'], 'correct_option' => 1],
            ['text' => 'If an investment grows 8% annually, which expression gives its value after n years?', 'level' => 5, 'options' => ['P + 0.08n', 'P(1.08)^n', 'P(0.08)^n', 'P  1.08n'], 'correct_option' => 1],
            ['text' => 'What is the derivative of x - 4x?', 'level' => 5, 'options' => ['3x - 4', 'x - 4', '3x', 'x4 - 2x'], 'correct_option' => 0],
            ['text' => 'Which research design best establishes a causal effect?', 'level' => 5, 'options' => ['Cross-sectional survey', 'Randomized controlled experiment', 'Case report', 'Opinion poll'], 'correct_option' => 1],
            ['text' => 'A solution contains 0.01 moles of solute in 0.5 liters. What is its molarity?', 'level' => 5, 'options' => ['0.005 M', '0.02 M', '0.05 M', '0.2 M'], 'correct_option' => 1],
            ['text' => 'Which algorithm has average time complexity O(n log n)?', 'level' => 5, 'options' => ['Linear search', 'Binary search', 'Merge sort', 'Bubble sort'], 'correct_option' => 2],
            ['text' => 'What does a 95% confidence interval quantify?', 'level' => 5, 'options' => ['The probability a parameter is in one computed interval', 'A range from a method that captures the parameter in 95% of repeated samples', 'The chance that 95% of data are correct', 'A guaranteed range for every observation'], 'correct_option' => 1],
            ['text' => 'Which constitutional principle divides power among branches of government?', 'level' => 5, 'options' => ['Federalism', 'Judicial review', 'Separation of powers', 'Popular sovereignty'], 'correct_option' => 2],
            ['text' => 'If all A are B and no B are C, what must be true?', 'level' => 5, 'options' => ['Some A are C', 'No A are C', 'All C are A', 'All B are A'], 'correct_option' => 1],
        ];
    }
}
