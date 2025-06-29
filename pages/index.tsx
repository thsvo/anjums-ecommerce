import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TailwindTest from '../components/TailwindTest';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: {
    name: string;
  };
  averageRating: number;
  reviewCount: number;
  images?: Array<{
    id: string;
    url: string;
    isMain: boolean;
  }>;
}

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const productsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse, allProductsResponse, trendingResponse] = await Promise.all([
        axios.get('/api/products?featured=true'),
        axios.get('/api/categories'),
        axios.get('/api/products', {
          params: {
            limit: 100 // Get a larger number to show pagination
          }
        }),
        axios.get('/api/products/trending', {
          params: {
            limit: 4 // Get 4 trending products for the section
          }
        })
      ]);

      setFeaturedProducts(productsResponse.data.products || []);
      setCategories(categoriesResponse.data.categories || []);
      setAllProducts(allProductsResponse.data.products || []);
      setTrendingProducts(trendingResponse.data.products || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      if (user) {
        alert('Product added to cart successfully!');
      } else {
        alert('Product added to cart! Please login to checkout.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Pagination handler functions
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Smooth scroll to the all products section
    document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get current page products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(allProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Anjum's - Your Ultimate Shopping Destination</title>
        <meta name="description" content="Millions of products, great deals, fast delivery - Shop everything you need at ShopHub" />
      </Head>

      <div className="min-h-screen bg-gray-50">
      
        {        /* Hero Component */}
        <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-4">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    🔥 MEGA SALE
                  </span>
                </div>
                <h1 className="text-6xl font-bold mb-6 leading-tight">
                  Shop Smart,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    Save Big
                  </span>
                </h1>
                <p className="text-xl mb-8 opacity-90 leading-relaxed">
                  Discover millions of products from trusted sellers worldwide. 
                  Get the best deals with fast shipping and secure payments.
                </p>
                
              
                <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl">
                  <div className="flex">
                    <select className="px-4 py-4 border-r border-gray-200 text-gray-700 bg-transparent rounded-l-xl focus:outline-none">
                      <option>All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Search for products, brands and more..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-6 py-4 text-gray-900 outline-none bg-transparent"
                    />
                    <button 
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-white font-semibold rounded-r-xl transition-all transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">50M+</div>
                    <div className="text-sm opacity-80">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">1M+</div>
                    <div className="text-sm opacity-80">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">200+</div>
                    <div className="text-sm opacity-80">Countries</div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">Today's Hot Deals</h3>
                      <p className="opacity-80">Limited time offers</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            �
                          </div>
                          <div>
                            <div className="font-semibold">Electronics</div>
                            <div className="text-sm opacity-80">Up to 60% off</div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold">→</div>
                      </div>
                      <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                            👕
                          </div>
                          <div>
                            <div className="font-semibold">Fashion</div>
                            <div className="text-sm opacity-80">Up to 80% off</div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold">→</div>
                      </div>
                      <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                            🏠
                          </div>
                          <div>
                            <div className="font-semibold">Home & Garden</div>
                            <div className="text-sm opacity-80">Up to 45% off</div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold">→</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Enhanced Quick Links */}
        <section className="py-4 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center space-x-8 text-sm">
              <Link href="/deals" className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-semibold">
                <span>🔥</span>
                <span>Today's Deals</span>
              </Link>
              <Link href="/categories" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                <span>📂</span>
                <span>All Categories</span>
              </Link>
              <Link href="/brands" className="flex items-center space-x-2 text-purple-600 hover:text-purple-800">
                <span>⭐</span>
                <span>Top Brands</span>
              </Link>
              <Link href="/new-arrivals" className="flex items-center space-x-2 text-green-600 hover:text-green-800">
                <span>✨</span>
                <span>New Arrivals</span>
              </Link>
              <Link href="/customer-service" className="flex items-center space-x-2 text-orange-600 hover:text-orange-800">
                <span>🎧</span>
                <span>Customer Service</span>
              </Link>
              <Link href="/track-order" className="flex items-center space-x-2 text-teal-600 hover:text-teal-800">
                <span>📦</span>
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Shop by Category</h2>
              <p className="text-gray-600 text-lg">Discover amazing products across all categories</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {categories.length > 0 ? categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <div className="group bg-gradient-to-br from-gray-50 to-white hover:from-orange-50 hover:to-red-50 p-6 rounded-2xl text-center transition-all duration-300 cursor-pointer border border-gray-100 hover:border-orange-200 hover:shadow-lg transform hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{category.name}</h3>
                  </div>
                </Link>
              )) : (
                // Fallback categories if none exist
                [
                  { name: 'Electronics', icon: '📱', color: 'from-blue-400 to-blue-600' },
                  { name: 'Fashion', icon: '👕', color: 'from-pink-400 to-pink-600' },
                  { name: 'Home & Garden', icon: '🏠', color: 'from-green-400 to-green-600' },
                  { name: 'Sports', icon: '⚽', color: 'from-orange-400 to-orange-600' },
                  { name: 'Books', icon: '📚', color: 'from-purple-400 to-purple-600' },
                  { name: 'Beauty', icon: '💄', color: 'from-red-400 to-red-600' },
                  { name: 'Automotive', icon: '🚗', color: 'from-gray-400 to-gray-600' },
                  { name: 'Toys & Games', icon: '🎮', color: 'from-yellow-400 to-yellow-600' }
                ].map((category, index) => (
                  <Link key={index} href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="group bg-gradient-to-br from-gray-50 to-white hover:from-orange-50 hover:to-red-50 p-6 rounded-2xl text-center transition-all duration-300 cursor-pointer border border-gray-100 hover:border-orange-200 hover:shadow-lg transform hover:-translate-y-1">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <span className="text-white text-2xl">{category.icon}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{category.name}</h3>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* All Products Section */}
        <section id="all-products-section" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-4 text-gray-900">All Products</h2>
                <p className="text-gray-600 text-lg">Discover our wide range of products</p>
              </div>
              <Link href="/products" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all">
                View All Products →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {currentProducts.length > 0 ? currentProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative">
                      <Image
                        src={
                          // First priority: main image from images array
                          product.images?.find(img => img.isMain)?.url ||
                          // Second priority: first image from images array
                          product.images?.[0]?.url ||
                          // Third priority: legacy image field
                          product.image ||
                          // Fallback: placeholder
                          `https://via.placeholder.com/250x200?text=${encodeURIComponent(product.name)}`
                        }
                        alt={product.name}
                        width={250}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(product.averageRating || 4))}{'☆'.repeat(5 - Math.floor(product.averageRating || 4))}
                        </div>
                        <span className="text-gray-600 text-sm ml-2">({product.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">৳{product.price}</span>
                        <span className="text-gray-500 line-through text-sm">৳{(product.price * 1.2).toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                          disabled={addingToCart === product.id}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <Link 
                          href={`/product/${product.id}`}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold text-center transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              )) : (
                // Sample products if none exist
                Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={`https://via.placeholder.com/250x200?text=Product+${i + 1}`}
                        alt={`Sample Product ${i + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      {i % 3 === 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Sale
                        </div>
                      )}
                      {i % 3 === 1 && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          New
                        </div>
                      )}
                      {i % 3 === 2 && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Popular
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Product {i + 1}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                        <span className="text-gray-600 text-sm ml-2">({10 + i})</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-orange-600">${19.99 + i * 5}</span>
                          {i % 2 === 0 && <span className="text-gray-500 line-through text-sm ml-2">${29.99 + i * 5}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Sample product demonstration - show alert
                            alert(`This is a demo product. In a real store, this would add Product ${i + 1} to your cart.`);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // View details functionality for sample products
                            alert(`Sample Product ${i + 1} details would be shown here`);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button 
                    onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${isActive ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Flash Deals Banner */}
        <section className="py-12 bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-yellow-400 text-red-600 p-3 rounded-full">
                    <span className="text-2xl font-bold">⚡</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold">Flash Sale</h2>
                    <p className="text-xl opacity-90">Limited time offers - Up to 80% off</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                    🎯 Best Prices Guaranteed
                  </span>
                  <span className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                    🚚 Free Shipping
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm opacity-90 mb-2">Sale ends in:</div>
                <div className="flex space-x-2">
                  <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold text-lg min-w-[60px]">
                    <div className="text-2xl">12</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold text-lg min-w-[60px]">
                    <div className="text-2xl">34</div>
                    <div className="text-xs">Mins</div>
                  </div>
                  <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold text-lg min-w-[60px]">
                    <div className="text-2xl">56</div>
                    <div className="text-xs">Secs</div>
                  </div>
                </div>
                <Link href="/deals" className="inline-block mt-4 bg-yellow-400 text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors">
                  Shop Flash Deals →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Products Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">🔥 Trending Categories</h2>
              <p className="text-gray-600 text-lg">Hot products from the most popular categories this week</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {trendingProducts.length > 0 ? trendingProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={product.images && product.images.length > 0 
                        ? product.images.find(img => img.isMain)?.url || product.images[0].url 
                        : product.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      🔥 Trending
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.category.name}
                    </div>
                    {product.averageRating >= 4.5 && (
                      <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ⭐ Top Rated
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {product.category.name}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i}>
                            {i < Math.floor(product.averageRating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm ml-2">
                        ({product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-orange-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                          disabled={addingToCart === product.id}
                          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button 
                          onClick={() => window.location.href = `/product/${product.id}`}
                          className="bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all transform hover:scale-105 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                // Fallback when no trending category products are available
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={`https://via.placeholder.com/300x200?text=Trending+Categories`}
                        alt={`Trending Category ${i + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Coming Soon
                      </div>
                      <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Category
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          Sample Category
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Trending Categories Coming Soon</h3>
                      <div className="flex items-center mb-3">
                        <div className="flex text-gray-300 text-sm">☆☆☆☆☆</div>
                        <span className="text-gray-600 text-sm ml-2">(No reviews yet)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-400">$--</span>
                        </div>
                        <button className="bg-gray-400 text-white px-3 py-2 rounded-lg font-semibold text-sm cursor-not-allowed">
                          Coming Soon
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Top Brands Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Top Brands</h2>
              <p className="text-gray-600 text-lg">Shop from the world's most trusted brands</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'Apple', logo: '🍎' },
                { name: 'Samsung', logo: '📱' },
                { name: 'Nike', logo: '✓' },
                { name: 'Adidas', logo: '🏃' },
                { name: 'Sony', logo: '🎮' },
                { name: 'LG', logo: '📺' }
              ].map((brand, index) => (
                <div key={index} className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-orange-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg group cursor-pointer">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{brand.logo}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{brand.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Featured Products */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
                <p className="text-gray-600 text-lg">Hand-picked products just for you</p>
              </div>
              <Link href="/products" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all">
                View All Products →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative">
                      <Image
                        src={
                          // First priority: main image from images array
                          product.images?.find(img => img.isMain)?.url ||
                          // Second priority: first image from images array
                          product.images?.[0]?.url ||
                          // Third priority: legacy image field
                          product.image ||
                          // Fallback: placeholder
                          `https://via.placeholder.com/250x200?text=${encodeURIComponent(product.name)}`
                        }
                        alt={product.name}
                        width={250}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        New
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(product.averageRating || 4))}{'☆'.repeat(5 - Math.floor(product.averageRating || 4))}
                        </div>
                        <span className="text-gray-600 text-sm ml-2">({product.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">৳{product.price}</span>
                        <span className="text-gray-500 line-through text-sm">৳{(product.price * 1.4).toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                          disabled={addingToCart === product.id}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <Link 
                          href={`/product/${product.id}`}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold text-center transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Link>
                </div>
              )) : (
                // Enhanced sample products if none exist
                Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={`https://via.placeholder.com/250x200?text=Product+${i + 1}`}
                        alt={`Sample Product ${i + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      {i < 3 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Sale
                        </div>
                      )}
                      {i >= 3 && i < 6 && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          New
                        </div>
                      )}
                      {i >= 6 && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Popular
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Premium Product {i + 1}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                        <span className="text-gray-600 text-sm ml-2">(89)</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-orange-600">${29 + i * 10}</span>
                          {i < 3 && <span className="text-gray-500 line-through text-sm ml-2">${39 + i * 10}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Sample product demonstration - show alert
                            alert(`This is a demo premium product. In a real store, this would add Premium Product ${i + 1} to your cart.`);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // View details functionality for sample products
                            alert(`Premium Product ${i + 1} details would be shown here`);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Why Choose ShopHub?</h2>
              <p className="text-gray-600 text-lg">Experience the best online shopping with our premium services</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Free Shipping</h3>
                <p className="text-gray-600">Free delivery on orders over ৳50. Fast shipping worldwide with tracking.</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Payment</h3>
                <p className="text-gray-600">100% secure SSL encryption. Multiple payment options available.</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">↩️</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy. No questions asked, hassle-free returns.</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl">🎧</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">24/7 Support</h3>
                <p className="text-gray-600">Round the clock customer assistance via chat, email, and phone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Stay Updated with Latest Deals</h2>
              <p className="text-xl mb-8 opacity-90">Subscribe to our newsletter and get exclusive offers, flash sales, and new arrivals</p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 outline-none text-lg"
                />
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                  Subscribe Now
                </button>
              </div>
              
              <div className="flex justify-center items-center space-x-6 mt-8 text-sm opacity-80">
                <span>✓ Exclusive deals</span>
                <span>✓ Early access</span>
                <span>✓ No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">What Our Customers Say</h2>
              <p className="text-gray-600 text-lg">Join millions of satisfied customers worldwide</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  rating: 5,
                  review: "Amazing shopping experience! Fast delivery and excellent customer service. Highly recommended!",
                  avatar: "👩"
                },
                {
                  name: "Mike Chen",
                  rating: 5,
                  review: "Great prices and quality products. The flash sales are incredible. Been shopping here for 2 years!",
                  avatar: "👨"
                },
                {
                  name: "Emily Davis",
                  rating: 5,
                  review: "Love the variety of products and brands. Easy returns and secure payments. My go-to shopping site!",
                  avatar: "👩‍💼"
                }
              ].map((review, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.name}</h4>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{review.review}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
    
      </div>
    </>
  );
}
