import Navbar from "../../components/Navbar/Navbar"
import HeroSection from '../../components/HeroSection/HeroSection';
import Stats from '../../components/Stats/Stats';
import Team from '../../components/Team/Team';
import IITCards from '../../components/IITCards/IITCards';
import WhySection from '../../components/WhySection/WhySection';
import Testimonials from '../../components/Testimonials/Testimonials';
import Footer from '../../components/Footer/Footer';

function App() {
    return (
        <>
            <HeroSection />
            <Stats />
            <Team />
            <IITCards />
            <WhySection />
            <Testimonials />
        </>
    );
}

export default App;