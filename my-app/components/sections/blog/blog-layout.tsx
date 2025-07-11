import Image from 'next/image';

const blogPosts = [
  {
    title: 'The Top Film Grants in 2024 That You Need to Know About',
    image: '/images/film-grants.jpg', // Replace with actual image path
  },
  {
    title: 'Creating a Client Focused Design Process with Mitch Monson, Sibling Rivalry',
    image: '/images/client-process.jpg',
  },
  {
    title: 'Day Rates For Film Crew 2024: A Comprehensive Guide',
    image: '/images/film-crew.jpg',
  }
];

export default function Blog() {
  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Blog</h1>
      <p className="text-gray-500 mb-6">
        Protect your right to free speech with decentralized messaging, metadata privacy, and end-to-end encryption.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {blogPosts.map((post, index) => (
          <div
            key={index}
            className={`relative rounded-xl overflow-hidden shadow-md ${
              index === 0 ? 'md:col-span-2' : ''
            }`}
          >
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={800}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h2 className="text-white text-lg font-semibold p-4">{post.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
