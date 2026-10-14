import './About.css';

function About() {
    const features = [
    {
      title: 'Explore Places',
      description: 'Discover breathtaking destinations around the world curated just for you.',
    },
    {
      title: 'Add Posts',
      description: 'Share your travel experiences, tips, and guides with our community.',
    },
    {
      title: 'Add Short Videos',
      description: 'Upload quick travel reels and inspire others with your adventures.',
    },
    {
      title: 'Personalized Suggestions',
      description: 'Get suggestions based on your interests, location, and past activity.',
    },
    {
      title: 'User-Friendly Interface',
      description: 'Simple and clean layout that’s easy to use on any device.',
    },
    {
      title: 'Community Driven',
      description: 'Engage with fellow travelers, comment on posts, and build your network.',
    },
  ];

  return (
    <div id="about" className="about-container">
      <h1 className="about-heading">ABOUT US</h1>
      <p className="about-intro">
        Welcome to Travलिन — your personalized travel companion. We aim to create a platform
        where explorers can discover, share, and inspire each other with amazing travel content.
        Whether you're a casual tourist or an adventurous backpacker, Travलिन helps you connect
        with the world like never before.
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

}

export default About;