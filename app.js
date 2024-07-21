const fs = require("fs");

// For Test : only change the path of the sudoko datafile and run ...
const sudokoDataFile = fs.readFileSync("./tests/easy.txt", "utf-8");

const generationSize = 2500;
const generationNumber = 100;

sudokoData = sudokoDataFile
   .split("\r\n")
   .map((sudokoLine) => sudokoLine.split(" ").map((sudokoElem) => +sudokoElem));

const tableInit = () => {
   return sudokoData.map((sudokoRow) => {
      const newSudokoRow = [...sudokoRow];
      const notInRow = [],
         emptyIndexes = [];
      for (let i = 1; i < 10; i++) {
         if (!sudokoRow.includes(i)) {
            notInRow.push(i);
         }
         if (sudokoRow[i - 1] === 0) {
            emptyIndexes.push(i - 1);
         }
      }
      for (let i = 0; i < notInRow.length; i++) {
         const randIndex = Math.floor(Math.random() * emptyIndexes.length);
         newSudokoRow[emptyIndexes[randIndex]] = notInRow[i];
         emptyIndexes.splice(randIndex, 1);
      }
      return newSudokoRow;
   });
};
const fitness = (table) => {
   let repeatNumber = 0;
   for (let i = 0; i < 9; i++) {
      const reapitition = {};
      for (let j = 0; j < 9; j++) {
         if (reapitition[table[j][i]] === 1) {
            repeatNumber++;
         } else {
            reapitition[table[j][i]] = 1;
         }
      }
   }
   let x = 0,
      y = 0;
   while (true) {
      reapitition = {};
      for (let i = x; i < x + 3; i++) {
         for (let j = y; j < y + 3; j++) {
            if (reapitition[table[j][i]] === 1) {
               repeatNumber++;
            } else {
               reapitition[table[j][i]] = 1;
            }
         }
      }
      if (x === 6 && y === 6) {
         break;
      } else if (x === 6) {
         x = 0;
         y += 3;
      } else {
         x += 3;
      }
   }
   return repeatNumber;
};

const buildFitnessDistribution = (population) => {
   let fitnessArray = [],
      sumOfFitness = 0;
   for (let i = 0; i < generationSize; i++) {
      const myFitness = fitness(population[i]);
      sumOfFitness += myFitness;
      fitnessArray.push(myFitness);
   }
   const fitnessDistribution = [];
   for (let i = 0; i < generationSize; i++) {
      if (fitnessDistribution.length === generationSize) {
         break;
      }
      // console.log((fitnessArray[i] * generationSize) / sumOfFitness);
      fitnessDistribution.push(
         ...Array(
            Math.ceil((fitnessArray[i] * generationSize * 2) / sumOfFitness)
         ).fill(i)
      );
   }
   fitnessArray.splice(0, generationSize);
   return fitnessDistribution;
};

const parentSelection = (fitnessDistribution) => {
   let firstSelectedChildIndex = Math.floor(Math.random() * generationSize),
      secondSelectedChildIndex = -1;
   do {
      secondSelectedChildIndex = Math.floor(Math.random() * generationSize);
   } while (secondSelectedChildIndex === firstSelectedChildIndex);

   return [
      fitnessDistribution[firstSelectedChildIndex],
      fitnessDistribution[secondSelectedChildIndex],
   ];
};

const recombination = (firstCromosome, secondCromosome) => {
   const random = Math.floor(Math.random() * 9);
   const newChild = firstCromosome.slice(0, random);
   newChild.push(...secondCromosome.slice(random, 9));
   return newChild;
};

const mutation = (table) => {
   const i = Math.floor(Math.random() * 9);
   const firstRandomIndex = Math.floor(Math.random() * 9);
   const secondRandomIndex = Math.floor(Math.random() * 9);
   [table[i][firstRandomIndex], table[i][secondRandomIndex]] = [
      table[i][secondRandomIndex],
      table[i][firstRandomIndex],
   ];
};

const generationHandler = () => {
   let generation = [];
   for (let i = 0; i < generationSize; i++) {
      generation.push(tableInit());
   }
   let bestSoFar = Infinity;
   let bestSoFarData = [];
   for (let indx = 0; indx < generationNumber; indx++) {
      generation.sort((a, b) => fitness(a) - fitness(b));
      const fitnessDistribution = buildFitnessDistribution(generation);
      let newGeneration = [];
      for (let i = 0; i < generationSize; i++) {
         const [firstCromosomeIndex, secondCromosomeIndex] =
            parentSelection(fitnessDistribution);
         const newChild = recombination(
            generation[firstCromosomeIndex],
            generation[secondCromosomeIndex]
         );
         newGeneration.push(newChild);
      }
      const bestOfThisRound = fitness(newGeneration[0]);
      if (bestOfThisRound < bestSoFar) {
         bestSoFarData = newGeneration[0];
         bestSoFar = bestOfThisRound;
      }
      console.log(
         `----------------  The best fitness of this round : ${bestOfThisRound}  The best fitness so far ${bestSoFar}  ----------------`
      );
      generation = [...newGeneration];
   }
   console.log(
      `---------------------------------- The best fitness : ${bestSoFar}  -------------------------------`
   );
   console.log(" The final sudoko table is this  : ");
   plotSudoko(bestSoFarData);
};

const plotSudoko = (tableData) => {
   console.log("-------------------------------------");
   for (let i = 0; i < 9; i++) {
      console.log("| " + tableData[i].join(" | ") + " |");
      console.log("-------------------------------------");
   }
}

generationHandler();