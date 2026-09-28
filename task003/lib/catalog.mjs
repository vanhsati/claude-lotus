// LDraw -> BrickLink / LEGO naming for the parts list.
export const COLORS = {
  // ldraw: [BrickLink id, BrickLink name, LEGO (Pick a Brick) name, hex]
  0: [11, 'Black', 'Black', '#1B2A34'],
  2: [6, 'Green', 'Dark Green', '#00852B'],
  10: [36, 'Bright Green', 'Bright Green', '#58AB41'],
  14: [3, 'Yellow', 'Bright Yellow', '#FAC80A'],
  15: [1, 'White', 'White', '#F4F4F4'],
  28: [69, 'Dark Tan', 'Sand Yellow', '#958A73'],
  29: [104, 'Bright Pink', 'Light Purple', '#E4ADC8'],
  43: [15, 'Trans-Light Blue', 'Transparent Light Blue', '#AEE9EF'],
  46: [19, 'Trans-Yellow', 'Transparent Yellow', '#F5CD2F'],
  57: [98, 'Trans-Orange', 'Transparent Bright Orange', '#F08F1C'],
  70: [88, 'Reddish Brown', 'Reddish Brown', '#5F3109'],
  71: [86, 'Light Bluish Gray', 'Medium Stone Grey', '#969696'],
  72: [85, 'Dark Bluish Gray', 'Dark Stone Grey', '#646464'],
  84: [150, 'Medium Nougat', 'Medium Nougat', '#AA7D55'],
  272: [63, 'Dark Blue', 'Earth Blue', '#19325A'],
  288: [80, 'Dark Green', 'Earth Green', '#00451A'],
  297: [115, 'Pearl Gold', 'Warm Gold', '#AA7F2E'],
  320: [59, 'Dark Red', 'Dark Red', '#720E0F'],
  484: [68, 'Dark Orange', 'Dark Orange', '#91501C'],
};
// LDraw file name -> BrickLink item number where they differ
export const BL_ID = { '4032a': '4032', '4185a': '4185', '6141': '4073', '6538b': '6538c', '32123a': '4265c' };
// short readable names (LDraw descriptions are used otherwise)
export const NAMES = {
  '87081': 'Brick, Round 4 x 4 with Pin Hole', '3709b': 'Technic, Plate 2 x 4 with 3 Holes', '50451': 'Technic, Axle 16',
  '3648b': 'Technic, Gear 24 Tooth', '4716': 'Technic, Worm Gear', '6538b': 'Technic, Axle Connector 2L', '4185a': 'Technic, Wedge Belt Wheel',
  '15535': 'Tile, Round 2 x 2 with Hole', '18674': 'Plate, Round 2 x 2 with 1 Center Stud', '24866': 'Plate, Round 1 x 1 with Flower Edge (5 Petals)',
  '98138': 'Tile, Round 1 x 1', '6141': 'Plate, Round 1 x 1', '4032a': 'Plate, Round 2 x 2 with Axle Hole', '3062b': 'Brick, Round 1 x 1',
  '53451': 'Minifigure, Headgear Accessory Horn (Viking)', '15070': 'Plate, Modified 1 x 1 with Tooth Vertical', '2423': 'Plant Leaves 4 x 3',
  '2417': 'Plant Leaves 6 x 5', '60596': 'Door Frame 1 x 4 x 6', '60623': 'Door 1 x 4 x 6 with 4 Panes and Stud Handle',
  '30055': 'Fence, Spindled 1 x 4 x 2', '3633': 'Fence, Lattice 1 x 4 x 1', '2877': 'Brick, Modified 1 x 2 with Grille (Fluted Profile)',
};
// colour combinations that are uncommon or that we could not confirm; the list suggests a fallback
export const VERIFY = {
  '3633|288': 'If unavailable in Dark Green, use Green (6) or Sand Green (48).',
  '53451|71': 'If unavailable in Light Bluish Gray, use White or Pearl Gold.',
  '18674|297': 'If unavailable in Pearl Gold, use a Pearl Gold 2 x 2 round plate (4032) or Light Bluish Gray.',
  '3941|28': 'If unavailable in Dark Tan, use Tan or Reddish Brown.',
  '3676|70': 'If unavailable in Reddish Brown, use Dark Brown or Dark Red.',
  '26603|28': 'If unavailable in Dark Tan, use two 1 x 3 tiles.',
};
export const HIDDEN_NOTE = 'Hidden structural colour — any colour works if this one is out of stock.';
