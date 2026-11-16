import AboutHero from './components/AboutHero';
import AboutStats from './components/AboutStats';
import AboutMission from './components/AboutMission';
import AboutValues from './components/AboutValues';
import AboutWhyChoose from './components/AboutWhyChoose';
import AboutTeam from './components/AboutTeam';
import AboutContact from './components/AboutContact';

const About = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md-down:py-10 sm-down:py-8 xs-down:py-6">
        <AboutHero />
        <AboutStats />
        <AboutMission />
        <AboutValues />
        <AboutWhyChoose />
        <AboutTeam />
        <AboutContact />
      </div>
    </div>
  );
};

export default About;
