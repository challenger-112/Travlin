import './TourTypes.css';

import adventure from '../../assets/images/adventure.jpeg';
import religious from '../../assets/images/religious.jpeg';
import beach from '../../assets/images/beach.jpeg';
import treking from '../../assets/images/treking.jpeg';
import family from '../../assets/images/family.jpeg'
import road from '../../assets/images/road.jpeg';

function TourTypes() {
    const tourTypes = [
    {
      title: 'Adventure Tours',
      description: 'Thrill-filled experiences including rafting, zip-lining, paragliding, and more.',
      image: adventure,
    },
    {
      title: 'Religious Tours',
      description: 'Explore spiritual destinations like temples, monasteries, and sacred sites.',
      image: religious,
    },
    {
      title: 'Beach Vacations',
      description: 'Relax by the sea at beautiful beaches with sunshine, sand, and surf.',
      image: beach,
    },
    {
      title: 'Trekking Tours',
      description: 'Conquer mountain trails with scenic views and unforgettable trekking adventures.',
      image: treking,
    },
    {
      title: 'Family Trips',
      description: 'Fun and easy-going tours perfect for family bonding and leisure.',
      image: family,
    },
    {
      title: 'Road Trips',
      description: 'Hit the road with curated routes, scenic drives, and unique stops.',
      image: road,
    }
  ];

  return (
    <div className="tour-types-container">
      <h2 className="tour-types-heading">TOUR TYPES</h2>
      <div className="tour-cards-grid">
        {tourTypes.map((type, index) => (
          <div className="tour-card" key={index}>
            <img src={type.image} alt={type.title} className="tour-card-image" />
            <h3>{type.title}</h3>
            <p>{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

}

export default TourTypes;