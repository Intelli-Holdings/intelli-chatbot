import Image from 'next/image';
import Link from 'next/link';

const Blog = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-left mb-4">Our <br /> .Blog</h1>
        <p className="text-gray-500 text-lg mb-8">
          Protect your right to free speech with decentralized messaging, metadata privacy, and e2e encryption.
        </p>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* First Article */}
          <Link href="#">
            <div className="relative group">
              <Image
                src="/path-to-your-image.jpg"
                alt="The Top Film Grants"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <h2 className="text-white text-xl font-semibold">
                  The Top Film Grants in 2024 That You Need to Know About
                </h2>
              </div>
            </div>
          </Link>

          {/* Second Article */}
          <Link href="#">
            <div className="relative group">
              <Image
                src="/path-to-your-image.jpg"
                alt="Creating a Client Focused Design"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <h2 className="text-white text-xl font-semibold">
                  Creating a Client Focused Design Process with Mitch Monson, Sibling Rivalry
                </h2>
              </div>
              <div className="absolute bottom-4 right-4 bg-white text-black rounded-full p-2">
                <span className="text-sm">Read</span>
              </div>
            </div>
          </Link>

          {/* Third Article */}
          <Link href="#">
            <div className="relative group">
              <Image
                src="/path-to-your-image.jpg"
                alt="Day Rates For Film Crew"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <h2 className="text-white text-xl font-semibold">
                  Day Rates For Film Crew 2024: A Comprehensive Guide
                </h2>
              </div>
            </div>
          </Link>

          {/* Fourth Article */}
          <Link href="#">
            <div className="relative group">
              <Image
                src="/path-to-your-image.jpg"
                alt="Client Focused Design"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <h2 className="text-white text-xl font-semibold">
                  Creating a Client Focused Design Process with Mitch Monson, Sibling Rivalry
                </h2>
              </div>
            </div>
          </Link>

          {/* Fifth Article */}
          <Link href="#">
            <div className="relative group">
              <Image
                src="/path-to-your-image.jpg"
                alt="Film Crew"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <h2 className="text-white text-xl font-semibold">
                  Day Rates For Film Crew 2024: A Comprehensive Guide
                </h2>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
