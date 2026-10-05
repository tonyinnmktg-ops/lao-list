// Metro areas group nearby cities. Each place is [city, state] and must match the DB exactly.
// Add a suburb here when new listings arrive outside the core city.
export const METROS = [
  {
    slug: 'bay-area', label: 'Bay Area', region: 'California',
    places: [['Oakland','California'],['San Francisco','California'],['Alameda','California'],['Concord','California'],
      ['El Sobrante','California'],['Albany','California'],['Berkeley','California'],['Fremont','California'],
      ['Richmond','California'],['San Jose','California'],['San Leandro','California'],['San Pablo','California'],
      ['San Rafael','California'],['Fairfield','California'],['Suisun','California']],
  },
  {
    slug: 'central-valley', label: 'Fresno & Central Valley', region: 'California',
    places: [['Fresno','California'],['Merced','California'],['Modesto','California'],['Stockton','California'],
      ['Visalia','California'],['Porterville','California'],['Ceres','California']],
  },
  {
    slug: 'dallas-fort-worth', label: 'Dallas–Fort Worth', region: 'Texas',
    places: [['Dallas','Texas'],['Fort Worth','Texas'],['Haltom City','Texas'],['Irving','Texas'],['Allen','Texas'],
      ['Arlington','Texas'],['Bedford','Texas'],['Garland','Texas'],['Prosper','Texas'],['Rowlett','Texas']],
  },
  {
    slug: 'greater-los-angeles', label: 'Greater Los Angeles', region: 'California',
    places: [['Los Angeles','California'],['Garden Grove','California'],['Anaheim','California'],['Mission Hills','California'],
      ['Long Beach','California'],['Signal Hill','California'],['Huntington Beach','California'],['Costa Mesa','California'],
      ['Westminster','California'],['Corona','California'],['Rancho Cucamonga','California'],['Lake Elsinore','California']],
  },
  {
    slug: 'twin-cities', label: 'Twin Cities', region: 'Minnesota',
    places: [['Minneapolis','Minnesota'],['Saint Paul','Minnesota'],['Eden Prairie','Minnesota'],['Golden Valley','Minnesota']],
  },
  {
    slug: 'seattle', label: 'Seattle Area', region: 'Washington',
    places: [['Seattle','Washington'],['Bellevue','Washington'],['Kent','Washington'],['Auburn','Washington'],
      ['Lynnwood','Washington'],['Bremerton','Washington'],['Monroe','Washington']],
  },
  {
    slug: 'sacramento', label: 'Sacramento', region: 'California',
    places: [['Sacramento','California'],['West Sacramento','California'],['Fair Oaks','California']],
  },
  {
    slug: 'san-diego', label: 'San Diego', region: 'California',
    places: [['San Diego','California'],['Chula Vista','California']],
  },
  {
    slug: 'washington-dc', label: 'Washington DC', region: 'DC · Virginia',
    places: [['Washington','DC'],['Alexandria','Virginia'],['Falls Church','Virginia']],
  },
  {
    slug: 'portland', label: 'Portland', region: 'Oregon',
    places: [['Portland','Oregon']],
  },
  {
    slug: 'houston', label: 'Houston', region: 'Texas',
    places: [['Houston','Texas'],['Cypress','Texas'],['Kingwood','Texas'],['Spring','Texas']],
  },
  {
    slug: 'milwaukee', label: 'Milwaukee', region: 'Wisconsin',
    places: [['Milwaukee','Wisconsin']],
  },
]

export function getMetro(slug) {
  return METROS.find((m) => m.slug === slug) || null
}

export function inMetro(metro, biz) {
  return metro.places.some(([c, s]) => c === biz.city && s === biz.state)
}

// "City, State" is used as the city filter value so same-named cities in different states stay distinct
export function cityKey(biz) {
  return `${biz.city}, ${biz.state}`
}
