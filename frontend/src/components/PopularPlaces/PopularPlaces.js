import './PopularPlaces.css';

import gangtok from '../../assets/images/gangtok.avif';
import srinagar from '../../assets/images/srinagar.avif';
import darjeeling from '../../assets/images/darjeeling.jpg';
import ooty from '../../assets/images/ooty.jpeg';
import ladakh from '../../assets/images/ladakh.jpeg';
import nanital from '../../assets/images/nanital.jpg';

function PopularPlaces() {
    const popularPlaces = [
    {
      title: 'Gangtok',
      location : 'Sikkim, India',
      description: 'Incredibly alluring, pleasantly boisterous and wreathed in clouds - Gangtok, the capital of Sikkim, is one of the most popular hill stations in India. Lying at the height of 1650 m above sea level, the town during its bright sunny days offers spectacular views of Mt. Kanchenjunga.',
      image: gangtok,
    },
    {
      title: 'Srinagar',
      location: 'Jammu & Kashmir, India',
      description: 'Famously known as "Heaven on Earth", Srinagar is located in the union territory of Jammu & Kashmir, on the banks of river Jhelum. Known for its serene lakes, lush gardens, and Mughal-era architecture.',
      image: srinagar,
    },
    {
      title: 'Darjeeling',
      location: 'West Bengal, India',
      description: 'Darjeeling, the former summer capital of India under the British Raj, has evolved into one of most sought-after hill stations. This picturesque hill destination in West Bengal is ideal for a romantic honeymoon.',
      image: darjeeling,
    },
    {
      title: 'Ooty',
      location: 'Tamil Nadu, India',
      description: 'Nestled amidst Nilgiri hills, Ooty, also known as Udagamandalam, is a hill station in Tamil Nadu which serves as a top-rated tourist destination.',
      image: ooty,
    },
    {
      title: 'Ladakh',
      location: 'Union Teritory, India',
      description: 'Ladakh, located in the northernmost region of India, is a high-altitude desert renowned for its breathtaking landscapes, serene monasteries, and unique cultural heritage.',
      image: ladakh,
    },
    {
      title: 'Nanital',
      location: 'Uttarakhand, India',
      description: 'Nainital, a picturesque hill station in the Kumaon region of Uttarakhand, is known for its serene lakes, lush green hills, and pleasant climate.',
      image: nanital,
    },
  ];

  return (
    <div className="popular-places-container">
        <h2 className="popular-places-heading">POPULAR PLACES</h2>
        <div className="popular-places-grid">
          {popularPlaces.map((place, index) => (
            <div className="popular-place-card" key={index}>
              <img src={place.image} alt={place.title} className="place-card-image" />
              <h3>{place.title}</h3>
              <h4>{place.location}</h4>
              <p>{place.description}</p>
            </div>
          ))}
        </div>
      </div>
  );

}

export default PopularPlaces;