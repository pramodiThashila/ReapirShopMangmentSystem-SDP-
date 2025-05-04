import { Link } from 'react-router-dom';
import { CheckCircle, Clock, PenTool as Tool, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Electronics Repair & Service
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Fast repairs, genuine parts, and expert technicians to get your devices working perfectly again.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/job-status" className="btn bg-white text-primary-700 hover:bg-gray-100">
                Check Job Status
              </Link>
              <Link to="/feedback" className="btn bg-primary-700 text-white border border-primary-500 hover:bg-primary-800">
                Submit Feedback
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Bandu Electronics offers a comprehensive range of repair and maintenance services for all your electronic devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Tool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Repair Services</h3>
              <p className="text-gray-600">
                Expert repair for smartphones, laptops, TVs, and other electronic devices with genuine parts and warranty.
              </p>
            </div>

            {/* Service Card 2 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Diagnostics</h3>
              <p className="text-gray-600">
                Comprehensive diagnostic services to identify issues accurately before recommending repairs.
              </p>
            </div>

            {/* Service Card 3 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maintenance</h3>
              <p className="text-gray-600">
                Regular maintenance services to keep your devices running smoothly and extend their lifespan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We've made our repair process simple and transparent so you always know what's happening with your device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Drop Off Device</h3>
              <p className="text-gray-600">
                Bring your device to our store or schedule a pickup. We'll provide an initial assessment.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Diagnosis & Repair</h3>
              <p className="text-gray-600">
                Our experts diagnose the issue and repair your device with genuine parts and quality workmanship.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Pickup & Warranty</h3>
              <p className="text-gray-600">
                Pick up your repaired device and enjoy peace of mind with our repair warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Have questions about your repair?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Check the status of your repair job anytime using your phone number or job ID.
          </p>
          <Link to="/job-status" className="btn bg-white text-primary-700 hover:bg-gray-100">
            Check Job Status
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;