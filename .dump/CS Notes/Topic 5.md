# Static data structure

- no. of elements is predetermined and that is constant
- problems
  - memory inefficient
    - memory space is wasted when elements are not used, when as static data structureis defined it reserves space in the memory, the quantity depends on the no. of elements predefined in the data structure
  - can be iterated throguh using for loops
    - advnatage
    - can go forward, backwards and directly access as opposed to the single direction-ness of dynamic data structures

# Dynamic Data Structures

- no need to predefine the no. of elements
- each element exists in a particular memory address and is referred to as a node (common point for both types)
  - here the placement of all the elemets is spread out in the memory as opposed to a static data structure where all the elements are placed in a single block of memory
- Each node contains a "reference" to the memory address of the next element in the data structure.
- usually more memory efficient than static data stuctures as we can put data anywhere and there isn't a need to reserve space for all the elements at once.
- can be iterated through using while loops but only in one direction (forward only, no bacwards and no direct access)
- certain methods like length are not funcitonal as the length is not known at the time of creation of the data structure.
