// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useArweaveWallet, useDarkMode } from '../utils/util';
// import ReactPlayer from 'react-player/lazy';
// import { checkWalletBalance, getAllTransactions } from '../utils/wallet';
// import { useDispatch } from 'react-redux';
// import { setUserAddress } from '../redux/slices/arConnectionSlice';

// // Add TypeScript declarations for the Arweave wallet
// declare global {
//   interface Window {
//     // Rename to avoid conflict with existing declarations
//     arweaveWalletCustom: {
//       connect: (
//         permissions: string[], 
//         appInfo: { name: string; logo: string }, 
//         gateway: { host: string; port: number; protocol: string }
//       ) => Promise<void>;
//       disconnect: () => Promise<void>;
//       getActiveAddress: () => Promise<string>;
//       getActivePublicKey: () => Promise<string>;
//     };
//   }
// }
// interface feedPayload {
//   id: string;
//   title: string;
//   excerpt: string;
//   author: string;
//   authorAddress: string;
//   category: string; 
//   timestamp: string;
//   tags: string[];
//   likes: number;
//   comments: number;
//   videoUrl: string;
//   imageUrl: string;
//   isVideo: boolean;
// }

// interface mediaPayload {
//   [key: string]: {
//     videos: string[];
//     images: string[];
//   };
// }

// // Define the same interest categories as in ProfileCreation.tsx
// const interestOptions = [
//   { id: 'ai', label: 'AI' },
//   { id: 'learning', label: 'Learning' },
//   { id: 'news', label: 'News' },
//   { id: 'web3', label: 'Web3' },
//   { id: 'travel', label: 'Travel' },
//   { id: 'twitter', label: 'Twitter' },
//   { id: 'crypto', label: 'Cryptocurrency' },
//   { id: 'tech', label: 'Technology' },
//   { id: 'defi', label: 'DeFi' },
//   { id: 'nft', label: 'NFT' },
//   { id: 'dao', label: 'DAO' },
//   { id: 'metaverse', label: 'Metaverse' }
// ];

// // Generate sample feed items for each category (5 per category)
// const generateSampleFeedsByCategory = () => {
//   const items : feedPayload[] = [];
//   let idCounter = 1;

//   // Videos and images for each category
//   const categoryMedia : mediaPayload = {
//     ai: {
//       videos: [
//         'https://www.youtube.com/watch?v=3M_5oYU-IsU', // ChatGPT explained
//         'https://www.youtube.com/watch?v=oj-2Uu6CwQI', // AI and medicine
//         'https://www.youtube.com/watch?v=9PMuCAFJrXA', // Google AI
//         'https://www.youtube.com/watch?v=NrmMk1Myrxc', // AI in 2023
//         'https://www.youtube.com/watch?v=hRgSrEU2miE'  // Neural networks
//       ],
//       images: [
//         'https://engineering.fb.com/wp-content/uploads/2016/12/grid-AI.jpg',
//         'https://i.pinimg.com/736x/9b/84/0a/9b840ab38435b1fae3860d4865735b8d.jpg',
//         'https://i.pinimg.com/736x/b6/e1/3b/b6e13b07d7dfce83895dd4a40b5cfb09.jpg',
//         'https://i.pinimg.com/736x/6c/da/ee/6cdaee8ea3d0928b13fd8edbc02124af.jpg',
//         'https://i.pinimg.com/736x/04/35/87/04358731b4500e80ab92641f0323ee4a.jpg'
//       ]
//     },
//     learning: {
//       videos: [
//         'https://www.youtube.com/watch?v=5JKgUoY9pTg', // Learning techniques
//         'https://www.youtube.com/watch?v=V-UvSKe8jW4', // How to learn
//         'https://www.youtube.com/watch?v=Sn3Bvnpcabg', // Effective learning
//         'https://www.youtube.com/watch?v=j2sRcZoTYGw', // Programming
//         'https://www.youtube.com/watch?v=ukLnPbIffxE'  // Online learning
//       ],
//       images: [
//         'https://i.pinimg.com/736x/0e/4e/bf/0e4ebfc212b1fb7d8ef414032e3efb11.jpg',
//         'https://i.pinimg.com/736x/2c/e1/80/2ce180ff97a6d078bfc3da7eb849f56d.jpg',
//         'https://i.pinimg.com/736x/ac/23/ff/ac23ff597406ea65c047477c32aa33f0.jpg',
//         'https://i.pinimg.com/736x/bd/ca/5a/bdca5a49c577cd6c9885a0086fa7dad5.jpg',
//         'https://i.pinimg.com/736x/8e/bc/b1/8ebcb1446454f5400059f128c9bfb4ee.jpg'
//       ]
//     },
//     news: {
//       videos: [
//         'https://www.youtube.com/watch?v=JG0l3V0ElLY', // Tech news
//         'https://www.youtube.com/watch?v=s3wUMEcjJY8', // Daily news
//         'https://www.youtube.com/watch?v=MbkW08xlCpk', // Breaking news
//         'https://www.youtube.com/watch?v=CVl1Bgtj6bY', // World news
//         'https://www.youtube.com/watch?v=NvqKZHpKs-g'  // Business news
//       ],
//       images: [
//         'https://i.pinimg.com/474x/b2/a7/8b/b2a78b7520577fc3664213e22bffd2c3.jpg',
//         'https://i.pinimg.com/474x/21/09/1a/21091aba50a1d9c82dc6eab1dc5df6ca.jpg',
//         'https://i.pinimg.com/474x/74/d7/f2/74d7f223a059a135521a8eb7de9dfac7.jpg1',
//         'https://i.pinimg.com/474x/5c/04/4d/5c044dfa3ddd5ef809f1c8e473d9bf35.jpg',
//         'https://i.pinimg.com/474x/6c/82/f4/6c82f420bbf1b6210361cc40bed755ae.jpg'
//       ]
//     },
//     web3: {
//       videos: [
//         'https://www.youtube.com/watch?v=4II3GhPGvo4', // Web3 explained
//         'https://www.youtube.com/watch?v=nHhAEkG1y2U', // Web3 tutorial
//         'https://www.youtube.com/watch?v=wHTcrmhskto', // Web3 future
//         'https://www.youtube.com/watch?v=lik9hBIL1-Y', // Web3 real use
//         'https://www.youtube.com/watch?v=rIC1JSkJsQE'  // Web3 for beginners
//       ],
//       images: [
//         'https://i.pinimg.com/474x/a4/72/26/a472269de8c438b8b2d89ea0edfc03e3.jpg',
//         'https://i.pinimg.com/474x/44/18/94/441894ddfcd410952a19ba5716802019.jpg',
//         'https://i.pinimg.com/474x/01/14/b6/0114b612d66b093689d49c6f2b3b39b3.jpg',
//         'https://i.pinimg.com/474x/04/60/cf/0460cfc6840cca7cdb7d7ac82cc11afc.jpg',
//         'https://i.pinimg.com/474x/64/9e/44/649e447a33cf559b196c9852811043ae.jpg'
//       ]
//     },
//     travel: {
//       videos: [
//         'https://www.youtube.com/watch?v=pNmMLmoQw9I', // Travel tips
//         'https://www.youtube.com/watch?v=qWu5PVBQd0A', // Japan travel
//         'https://www.youtube.com/watch?v=K_7k9d4lgzg', // Italy travel
//         'https://www.youtube.com/watch?v=vzSHcyXfNPw', // Budget travel
//         'https://www.youtube.com/watch?v=WdJ-ubCYH_4'  // Travel vlog
//       ],
//       images: [
//         'https://i.pinimg.com/474x/87/f8/05/87f8054d09556ff2361ee3b59bebd574.jpg',
//         'https://i.pinimg.com/474x/17/47/53/174753ef051b3d126a442ca7d6f43d7c.jpg',
//         'https://i.pinimg.com/474x/62/e2/78/62e2781b5ce6216f5e9bd6c7f1500bcf.jpg',
//         'https://i.pinimg.com/474x/b0/a0/7a/b0a07ab0e7acbd6d6ff61fe653460231.jpg',
//         'https://i.pinimg.com/474x/ef/cf/33/efcf33b9cff23aac46a8e644bc5e7bee.jpg'
//       ]
//     },
//     twitter: {
//       videos: [
//         'https://www.youtube.com/watch?v=vJXWfm3e9Ck', // Twitter updates
//         'https://www.youtube.com/watch?v=CPZj8-G3Css', // Twitter marketing
//         'https://www.youtube.com/watch?v=qpWu9f2cXnc', // Twitter ads
//         'https://www.youtube.com/watch?v=HhwTkhvD0oo', // Twitter tips
//         'https://www.youtube.com/watch?v=6F3-InOdMP4'  // Twitter for business
//       ],
//       images: [
//         'https://i.pinimg.com/474x/32/22/1c/32221cf48886cfb4833ca99ff2e6ff72.jpg',
//         'https://i.pinimg.com/474x/3f/24/26/3f242682439a8d1e23f316d84d76efff.jpg',
//         'https://i.pinimg.com/736x/22/56/a2/2256a263ce864f7e03ea0ec66d34136a.jpg',
//         'https://i.pinimg.com/474x/df/92/a6/df92a6dcc6292e55e22633ee8949752b.jpg',
//         'https://i.pinimg.com/474x/1a/e8/bc/1ae8bcdcef865fe7a50e34148c8cb1ce.jpg'
//       ]
//     },
//     crypto: {
//       videos: [
//         'https://www.youtube.com/watch?v=rYQgy8QDEBI', // Crypto basics
//         'https://www.youtube.com/watch?v=SSo_EIwHSd4', // Bitcoin
//         'https://www.youtube.com/watch?v=Yb6825iv0Vk', // Ethereum
//         'https://www.youtube.com/watch?v=8qPDPlMSlwA', // Crypto trends
//         'https://www.youtube.com/watch?v=EH6vE97qIP4'  // Crypto investment
//       ],
//       images: [
//         'https://i.pinimg.com/474x/2d/5b/fc/2d5bfc01c8e0a79cebdc5f451351a524.jpg',
//         'https://i.pinimg.com/474x/f9/5d/22/f95d22789623dc3ce6a76e793ff752b5.jpg',
//         'https://i.pinimg.com/474x/17/09/c8/1709c8a8c493f4a9db7b94baa496b106.jpg',
//         'https://i.pinimg.com/736x/1a/75/0e/1a750e065686c64de229c4dad6ec0b96.jpg',
//         'https://i.pinimg.com/736x/fa/d3/45/fad3459cd6e5e6ccf57b44eac020d5d1.jpg'
//       ]
//     },
//     tech: {
//       videos: [
//         'https://www.youtube.com/watch?v=a8fHgx9mE5U', // Tech trends
//         'https://www.youtube.com/watch?v=0A_J5B8WqOc', // Future tech
//         'https://www.youtube.com/watch?v=Da3VbJMCYyY', // Tech reviews
//         'https://www.youtube.com/watch?v=M5QY2_8704o', // New technology
//         'https://www.youtube.com/watch?v=tO01J-M3g0U'  // Tech innovations
//       ],
//       images: [
//         'https://i.pinimg.com/474x/c9/88/0a/c9880a8abf25f389be7154e8fee18270.jpg',
//         'https://i.pinimg.com/474x/50/23/c7/5023c74a55669267f9bbc674c8d9d029.jpg',
//         'https://i.pinimg.com/474x/3b/bc/c8/3bbcc805505a0fd0ca31c0b9d5d99ee4.jpg',
//         'https://i.pinimg.com/736x/e3/da/0a/e3da0a3209b0797b8fc1fb2e90a2155a.jpg',
//         'https://i.pinimg.com/736x/4a/37/92/4a37927d51ed5e5f31387f5f245af808.jpg'
//       ]
//     },
//     defi: {
//       videos: [
//         'https://www.youtube.com/watch?v=k9HYC0EJU6E', // DeFi explained
//         'https://www.youtube.com/watch?v=H-O3ASEmpS8', // DeFi basics
//         'https://www.youtube.com/watch?v=o9ObYRjpIhs', // DeFi platforms
//         'https://www.youtube.com/watch?v=k1In9kRUGbE', // Yield farming
//         'https://www.youtube.com/watch?v=QfpobP6dDIQ'  // DeFi investing
//       ],
//       images: [
//         'https://i.pinimg.com/736x/78/69/12/786912b0c88f2e7a4e364045fd15cf1c.jpg',
//         'https://i.pinimg.com/736x/7c/6e/08/7c6e08fb64ee19ea947650756ef3c77d.jpg',
//         'https://i.pinimg.com/474x/eb/55/6b/eb556b46931c5dceee13dd129131f3bc.jpg',
//         'https://i.pinimg.com/474x/4b/36/ab/4b36ab68b620383dc87698126aa578a0.jpg',
//         'https://i.pinimg.com/474x/4c/ec/8d/4cec8d879334dfebb4240a9a1f260c20.jpg'
//       ]
//     },
//     nft: {
//       videos: [
//         'https://www.youtube.com/watch?v=FkUn86bH34M', // NFT explained
//         'https://www.youtube.com/watch?v=8Kqz2dnp3jE', // NFT art
//         'https://www.youtube.com/watch?v=zpROwouRo_M', // NFT marketplace
//         'https://www.youtube.com/watch?v=HE8SYGFjIVg', // NFT creation
//         'https://www.youtube.com/watch?v=C7J_nbz8UZA'  // NFT future
//       ],
//       images: [
//         'https://i.pinimg.com/474x/52/62/f2/5262f20325d1b5d64a2af8b0c8e78380.jpg',
//         'https://i.pinimg.com/474x/c4/39/34/c43934eb4d1ad82c3818b841529bccd6.jpg',
//         'https://i.pinimg.com/474x/03/b8/40/03b840da18db1834521177adac8a8c82.jpg',
//         'https://i.pinimg.com/474x/a7/0d/88/a70d88e4c623225cb41b623c22a29c72.jpg',
//         'https://i.pinimg.com/474x/12/70/1a/12701a55aa606851722ff23e9cd7dda8.jpg'
//       ]
//     },
//     dao: {
//       videos: [
//         'https://www.youtube.com/watch?v=KHm0uUPqmVE', // DAO explained
//         'https://www.youtube.com/watch?v=9k6t-9INkEM', // DAO governance
//         'https://www.youtube.com/watch?v=JvTgl1EfqRQ', // DAO basics
//         'https://www.youtube.com/watch?v=Qz7VTl-lUj4', // Popular DAOs
//         'https://www.youtube.com/watch?v=oMZhAa3_piM'  // DAO vs LLC
//       ],
//       images: [
//         'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
//         'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
//         'https://images.unsplash.com/photo-1559445368-b8a993a2e39f',
//         'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
//         'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd'
//       ]
//     },
//     metaverse: {
//       videos: [
//         'https://www.youtube.com/watch?v=9RH2X7HUfS0', // Metaverse explained
//         'https://www.youtube.com/watch?v=KD2TDt-EXtw', // Metaverse real estate
//         'https://www.youtube.com/watch?v=gElfIo6uw4g', // Metaverse future
//         'https://www.youtube.com/watch?v=CbI79e5iZKs', // Metaverse careers
//         'https://www.youtube.com/watch?v=gfYQr4QsQxU'  // Facebook metaverse
//       ],
//       images: [
//         'https://i.pinimg.com/474x/71/6f/bd/716fbd7342e90cc3e516477b0a1045ec.jpg',
//         'https://i.pinimg.com/474x/12/eb/41/12eb4102312787d821ba6847cef41113.jpg',
//         'https://i.pinimg.com/474x/a9/19/ef/a919efebd7c87e1c0f407fbf22109987.jpg',
//         'https://i.pinimg.com/474x/57/2d/3a/572d3a163324953c1bbce9e980f39b04.jpg',
//         'https://i.pinimg.com/474x/2c/59/a7/2c59a73527f59ca93ab0f78a640478da.jpg'
//       ]
//     }
//   };

//   interestOptions.forEach(category => {
//     const { id, label } = category;
//     const categoryVideos = categoryMedia[id]?.videos || [];
//     const categoryImages = categoryMedia[id]?.images || [];

//     // Create 5 items for each category
//     for (let i = 0; i < 10; i++) {
//       // Randomly decide if this item is a video or just an image
//       const isVideo = i < 5; // First 5 are videos, next 5 are images only
      
//       items.push({
//         id: String(idCounter++),
//         title: `${label} Insight ${i + 1}`,
//         excerpt: `Exploring the latest developments in ${label} and how they impact the Web3 ecosystem.`,
//         author: `${id}_expert${i + 1}`,
//         authorAddress: `ar${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 5)}`,
//         category: id,
//         timestamp: `${Math.floor(Math.random() * 23) + 1} hours ago`,
//         tags: [label, 'Web3', i % 2 === 0 ? 'Tutorial' : 'News', i % 3 === 0 ? 'Trending' : 'Featured'],
//         likes: Math.floor(Math.random() * 200) + 10,
//         comments: Math.floor(Math.random() * 50) + 1,
//         videoUrl: isVideo ? (categoryVideos[i % 5] || 'https://www.youtube.com/watch?v=4II3GhPGvo4') : '',
//         imageUrl: categoryImages[i % 5] || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
//         isVideo: isVideo
//       });
//     }
//   });

//   return items;
// };

// // Sample feed data with 5 items per category (60 total items)
// const sampleFeedItems = generateSampleFeedsByCategory();

// const Dashboard = () => {
  
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [feedItems, setFeedItems] = useState(sampleFeedItems);
//   const [displayedItems, setDisplayedItems] = useState<feedPayload[]>([]);
//   const [visibleCount, setVisibleCount] = useState(3);
//   const [filteredCategories, setFilteredCategories] = useState<string[]>(['All']);
//   const [loading, setLoading] = useState(false);
//   const [isPulsing, setIsPulsing] = useState(false);
//   const [walletBalance, setWalletBalance] = useState<string>('');
//   const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
//   const dispatch = useDispatch();

//   const {
//     userAddress,
//     userInterests,
//     handleDisconnect,
//     copyToClipboard,
//   } = useArweaveWallet();

//   const { darkMode, toggleDarkMode } = useDarkMode();

//   // Preserve user wallet address on page refresh
//   useEffect(() => {
//     const savedAddress = localStorage.getItem('userAddress');
//     if (savedAddress && !userAddress) {
//       dispatch(setUserAddress(savedAddress));
//     } else if (userAddress) {
//       localStorage.setItem('userAddress', userAddress);
//     }
//   }, [userAddress, dispatch]);

//   // Save important wallet details to prevent data loss on page refresh
//   useEffect(() => {
//     if (userAddress) {
//       const timestamp = new Date().toISOString();
      
//       // Create comprehensive wallet details object
//       const walletDetails = {
//         address: userAddress,
//         balance: walletBalance,
//         interests: userInterests || [],
//         transactions: transactions.length > 0 ? transactions.slice(0, 5) : [], // Save only latest 5 transactions to reduce storage size
//         lastSynced: timestamp,
//         isDarkMode: darkMode
//       };
      
//       // Save all important wallet details in one object
//       localStorage.setItem('curioWeaveWalletDetails', JSON.stringify(walletDetails));
//       console.log('Saved wallet details to localStorage at:', timestamp);
//     }
//   }, [userAddress, walletBalance, userInterests, transactions, darkMode]);

//   // Fetch wallet balance on address change or refresh
//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (!userAddress) return;
//       try {
//         const balance = await checkWalletBalance(userAddress);
//         setWalletBalance(balance || '0');
//         localStorage.setItem('walletBalance', balance || '0');
//       } catch (error) {
//         console.error("Error fetching balance:", error);
//         // Try to get from localStorage as fallback
//         const savedBalance = localStorage.getItem('walletBalance');
//         if (savedBalance) {
//           setWalletBalance(savedBalance);
//         } else {
//           setWalletBalance('0');
//         }
//       }
//     };

//     fetchBalance();
//   }, [userAddress]);

//   // Fetch transactions on initial load if available
//   useEffect(() => {
//     const loadTransactions = async () => {
//       if (!userAddress) return;
      
//       // Check if we have cached transactions
//       const cachedTransactions = localStorage.getItem('userTransactions');
      
//       if (cachedTransactions) {
//         try {
//           setTransactions(JSON.parse(cachedTransactions));
//         } catch (error) {
//           console.error("Error parsing cached transactions:", error);
//         }
//       }
      
//       // Always fetch fresh transactions, but don't show loading if we have cached data
//       if (!cachedTransactions) {
//         setIsTransactionsLoading(true);
//       }
      
//       try {
//         const userTransactions = await getAllTransactions(userAddress);
//         console.log("Transactions fetched successfully:", userTransactions);
        
//         // Ensure each transaction has a unique identifier
//         const uniqueTransactions = userTransactions.map((tx, index) => ({
//           ...tx,
//           uniqueKey: `${tx.id}-${tx.type}-${index}`
//         }));
        
//         setTransactions(uniqueTransactions);
        
//         // Cache the transactions
//         localStorage.setItem('userTransactions', JSON.stringify(uniqueTransactions));
//       } catch (error) {
//         console.error('Error fetching transactions:', error);
//       } finally {
//         setIsTransactionsLoading(false);
//       }
//     };

//     if (userAddress) {
//       loadTransactions();
//     }
//   }, [userAddress]);

//   // Load more items when user scrolls down
//   const handleScroll = () => {
//     if (window.innerHeight + document.documentElement.scrollTop >= 
//         document.documentElement.scrollHeight - 500 && 
//         !loading && 
//         visibleCount < feedItems.length) {
//       setLoading(true);
//       // Simulate loading delay
//       setTimeout(() => {
//         setVisibleCount(prev => prev + 3);
//         setLoading(false);
//       }, 500);
//     }
//   };

//   // Handle search input
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   // Handle search submission
//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
    
//     // Filter content based on search query
//     const filtered = sampleFeedItems.filter(item => 
//       item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//     );
    
//     setFeedItems(filtered);
//     setVisibleCount(3);
//     setSelectedCategory('All');
//   };

//   // Handle click on the floating action button
//   const handleFabClick = () => {
//     // Navigate to create content page
//     navigate('/create-content');
//   };

//   // Add pulse animation effect every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsPulsing(true);
//       setTimeout(() => {
//         setIsPulsing(false);
//       }, 3000); // Animation duration
//     }, 30000); // Run every 30 seconds
    
//     // Initial animation
//     setIsPulsing(true);
//     setTimeout(() => {
//       setIsPulsing(false);
//     }, 3000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Add scroll event listener
//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [feedItems, visibleCount, loading]);

//   // Update displayed items when visibleCount changes
//   useEffect(() => {
//     setDisplayedItems(feedItems.slice(0, visibleCount));
//   }, [feedItems, visibleCount]);

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [darkMode]);

//   // Filter categories based on user interests
//   useEffect(() => {
//     if (userInterests && userInterests.length > 0) {
//       // Map interest IDs to their labels
//       const userInterestLabels = userInterests.map(interestId => {
//         const option = interestOptions.find(opt => opt.id === interestId);
//         return option ? option.label : '';
//       }).filter(label => label !== '');

//       setFilteredCategories(['All', ...userInterestLabels]);
//     } else {
//       setFilteredCategories(['All']);
//     }
//   }, [userInterests]);

//   const filterByCategory = (category: string) => {
//     setSelectedCategory(category);
//     if (category === 'All') {
//       setFeedItems(sampleFeedItems);
//     } else {
//       // Convert the label back to ID for comparison with the sample feed items
//       const categoryId = interestOptions.find(option => option.label === category)?.id || category.toLowerCase();
      
//       const filtered = sampleFeedItems.filter(item => 
//         item.category === categoryId || 
//         item.tags.some(tag => tag.toLowerCase() === categoryId.toLowerCase())
//       );
//       setFeedItems(filtered);
//     }
//     // Reset pagination when changing category
//     setVisibleCount(3);
//   };

//   const handleTransactionsClick = async () => {
//     setIsTransactionsOpen(true);
//     setIsDropdownOpen(false);
//     setIsTransactionsLoading(true);
    
//     try {
//       const userTransactions = await getAllTransactions(userAddress);
//       console.log("Transactions fetched successfully:", userTransactions);
      
//       // Ensure each transaction has a unique identifier even if ID is the same
//       const uniqueTransactions = userTransactions.map((tx, index) => ({
//         ...tx,
//         uniqueKey: `${tx.id}-${tx.type}-${index}`
//       }));
      
//       setTransactions(uniqueTransactions);
      
//       // Cache the latest transactions
//       localStorage.setItem('userTransactions', JSON.stringify(uniqueTransactions));
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//     } finally {
//       setIsTransactionsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-tr dark:from-red-500 dark:via-black dark:to-blue-500 transition-colors duration-200">
//       {/* Navbar */}
//       <nav className="fixed w-full bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-md z-50">
//         <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
//           <div className="flex items-center justify-between h-20">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 ml-2 sm:ml-4">
//                 <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
//                   CurioWeave
//                 </Link>
//               </div>
//             </div>
            
//             {/* Search Bar */}
//             <div className="flex-1 mx-4 max-w-2xl hidden md:block">
//               <form onSubmit={handleSearchSubmit} className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search content..."
//                   value={searchQuery}
//                   onChange={handleSearch}
//                   className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 
//                            bg-white/90 dark:bg-gray-800/90 focus:outline-none focus:ring-2 
//                            focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
//                 />
//                 <button 
//                   type="submit"
//                   className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </form>
//             </div>
            
//             {/* Desktop navigation */}
//             <div className="hidden md:flex items-center space-x-5 mr-2 sm:mr-4">
//               <button
//                 onClick={toggleDarkMode}
//                 className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 aria-label="Toggle theme"
//               >
//                 {darkMode ? (
//                   <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 ) : (
//                   <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                   </svg>
//                 )}
//               </button>
              
//               {/* User profile dropdown */}
//               <div className="relative">
//                 <button 
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                   className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 h-[50px]"
//                 >
//                   <span className="mr-2">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Account'}</span>
//                   <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
                
//                 {/* Dropdown menu */}
//                 {isDropdownOpen && (
//                   <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 py-2">
//                     <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Connected as</p>
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userAddress}</p>
//                         <button 
//                           onClick={copyToClipboard}
//                           className="ml-2 text-blue-600 dark:text-blue-400"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
//                             <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
//                     <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{walletBalance}</p>
//                       </div>
//                     </div>
//                     <div className="px-2 py-2">
//                       <button 
//                         onClick={handleTransactionsClick}
//                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                         </svg>
//                         See Transactions
//                       </button>
//                       <button 
//                         onClick={handleDisconnect}
//                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mt-1"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2v3.586l3.586 3.586H10v-7z" clipRule="evenodd" />
//                           <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v7H6.414l2.293 2.293a1 1 0 101.414-1.414L7.828 9.172l3.535-3.535a1 1 0 10-1.414-1.414L5.172 9A2 2 0 005 10.172V15h6a1 1 0 001-1v-4.828a2 2 0 00-.586-1.414l-4-4A1 1 0 006 3.172V5h4V3a1 1 0 00-1-1z" clipRule="evenodd" />
//                         </svg>
//                         Disconnect Wallet
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden flex items-center mr-2">
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//               >
//                 <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   {isMenuOpen ? (
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   ) : (
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                   )}
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-white dark:bg-black/60 shadow-lg">
//             <div className="px-3 pt-3 pb-4 space-y-3 sm:px-4">
//               <div className="flex justify-center p-2">
//                 <button
//                   onClick={toggleDarkMode}
//                   className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   {darkMode ? (
//                     <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                     </svg>
//                   ) : (
//                     <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
              
//               {/* Mobile Search Bar */}
//               <div className="px-2">
//                 <form onSubmit={handleSearchSubmit} className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search content..."
//                     value={searchQuery}
//                     onChange={handleSearch}
//                     className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 
//                              bg-white/90 dark:bg-gray-800/90 focus:outline-none focus:ring-2 
//                              focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
//                   />
//                   <button 
//                     type="submit"
//                     className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                 </form>
//               </div>
              
//               <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow">
//                 <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Connected as</p>
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userAddress}</p>
//                     <button 
//                       onClick={copyToClipboard}
//                       className="ml-2 text-blue-600 dark:text-blue-400"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                         <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
//                         <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//                 <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Balance </p>
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{walletBalance}</p>
//                   </div>
//                 </div>
//                 <button 
//                   className="flex items-center w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                   </svg>
//                   See Transactions
//                 </button>
//                 <button 
//                   onClick={handleDisconnect}
//                   className="flex items-center w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2v3.586l3.586 3.586H10v-7z" clipRule="evenodd" />
//                     <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v7H6.414l2.293 2.293a1 1 0 101.414-1.414L7.828 9.172l3.535-3.535a1 1 0 10-1.414-1.414L5.172 9A2 2 0 005 10.172V15h6a1 1 0 001-1v-4.828a2 2 0 00-.586-1.414l-4-4A1 1 0 006 3.172V5h4V3a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   Disconnect Wallet
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 pt-28 pb-12">
//         <div className="flex flex-col items-center">
//           {/* Header with greeting */}
//           <div className="w-full max-w-5xl mb-8 text-left">
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Welcome Back!
//             </h1>
//             <p className="text-gray-600 dark:text-gray-300 mt-2">
//               Here's your personalized content feed based on your interests.
//             </p>
//           </div>

//           {/* Interest Categories / Filter */}
//           <div className="w-full max-w-5xl mb-8 overflow-x-auto">
//             <div className="flex justify-between items-center mb-2">
//               <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
//                 {searchQuery ? `Search results for "${searchQuery}"` : 'Categories'}
//               </h2>
              
//               {searchQuery && (
//                 <button
//                   onClick={() => {
//                     setSearchQuery('');
//                     setFeedItems(sampleFeedItems);
//                     setSelectedCategory('All');
//                   }}
//                   className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                   Clear search
//                 </button>
//               )}
//             </div>
            
//             <div className="flex space-x-2 py-2 px-1 min-w-max">
//               {filteredCategories.map((category) => (
//                 <button
//                   key={category}
//                   onClick={() => filterByCategory(category)}
//                   className={`px-4 py-2 rounded-full transition-all ${
//                     selectedCategory === category
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
//                   }`}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Feed Cards */}
//           <div className="w-full max-w-5xl grid grid-cols-1 gap-6">
//             {displayedItems.map((item) => (
//               <div 
//                 key={item.id}
//                 className="bg-white dark:bg-black/30 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
//               >
//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
//                       {item.category}
//                     </span>
//                     <span className="text-sm text-gray-500 dark:text-gray-400">
//                       {item.timestamp}
//                     </span>
//                   </div>
                  
//                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                     {item.title}
//                   </h2>

//                   <div className='h-[300px] md:h-[400px] w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden'>
//                     {item.isVideo ? (
//                       <ReactPlayer 
//                         url={item.videoUrl} 
//                         controls 
//                         height={'100%'} 
//                         width={'100%'} 
//                         light={item.imageUrl} 
//                         playing={false}
//                         playsinline
//                         config={{
//                           youtube: {
//                             playerVars: {
//                               origin: window.location.origin,
//                               rel: 0
//                             }
//                           }
//                         }}
//                       />
//                     ) : (
//                       <div className="relative w-full h-full">
//                         <img 
//                           src={item.imageUrl} 
//                           alt={item.title} 
//                           className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
//                           <p className="text-white text-lg font-semibold">{item.title}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <p className="text-gray-600 dark:text-gray-300 mb-4">
//                     {item.excerpt}
//                   </p>
                  
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {item.tags.map((tag, index) => (
//                       <span key={index} className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
                  
//                   <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
//                     <div className="flex items-center">
//                       <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
//                         {item.author.charAt(0).toUpperCase()}
//                       </div>
//                       <div className="ml-2">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">{item.author}</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">{item.authorAddress}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
//                         </svg>
//                         {item.likes}
//                       </button>
//                       <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
//                         </svg>
//                         {item.comments}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           {/* Loading indicator and Load More Button */}
//           {loading ? (
//             <div className="flex justify-center mt-8">
//               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : visibleCount < feedItems.length ? (
//             <button 
//               onClick={() => setVisibleCount(prev => prev + 3)}
//               className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
//             >
//               Load More
//             </button>
//           ) : feedItems.length > 0 ? (
//             <p className="mt-8 text-gray-600 dark:text-gray-400">You've reached the end of the feed</p>
//           ) : (
//             <p className="mt-8 text-gray-600 dark:text-gray-400">No items found in this category</p>
//           )}
//         </div>
//       </div>

//       {/* Floating Action Button */}
//       <button onClick={handleFabClick}
//         className={`fixed bottom-8 right-8 h-20 w-20 rounded-full bg-gradient-to-tr from-red-500 via-black/40 to-blue-500 text-white font-bold text-5xl transition flex justify-center items-center shadow-lg hover:shadow-xl z-50 ${isPulsing ? 'animate-pulse scale-125' : 'hover:scale-110'} duration-300`}>
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//         </svg>
//       </button>

//       {/* Transactions Sidebar */}
//       <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isTransactionsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
//             <button 
//               onClick={() => setIsTransactionsOpen(false)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {isTransactionsLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : transactions.length > 0 ? (
//             <div className="space-y-4">
//               {transactions.map((tx, index) => {
//                 console.log(`Rendering transaction ${index}:`, tx);
//                 return (
//                   <div key={tx.uniqueKey || `${tx.id}-${tx.type}-${index}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="flex items-center">
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             {tx.type === 'Profile Creation' ? (
//                               <span className="flex items-center">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                                 </svg>
//                                 Profile Creation
//                               </span>
//                             ) : tx.type === 'Content Upload' ? (
//                               <span className="flex items-center">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 101.414-1.414l-3 3a1 1 0 00-1.414 0l-3-3a1 1 0 000-1.414z" clipRule="evenodd" />
//                                 </svg>
//                                 Content Upload
//                               </span>
//                             ) : tx.type === 'Sent' ? (
//                               <span className="flex items-center">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
//                                 </svg>
//                                 Sent
//                               </span>
//                             ) : tx.type === 'Received' ? (
//                               <span className="flex items-center">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//                                 </svg>
//                                 Received
//                               </span>
//                             ) : (
//                               <span className="flex items-center">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
//                                   <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                                 </svg>
//                                 Content Upload
//                               </span>
//                             )}
//                           </p>
//                           {tx.status === 'Pending' && (
//                             <span className="ml-2 animate-pulse text-yellow-500">
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
//                               </svg>
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {tx.type === 'Sent' ? `To: ${tx.recipient}` : 
//                            tx.type === 'Received' ? `From: ${tx.sender}` :
//                            `By: ${tx.sender.slice(0, 6)}...${tx.sender.slice(-6)}`}
//                         </p>
//                         {(tx.type === 'Content Upload' || tx.type === 'Profile Creation') && (
//                           <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                             Size: {Math.round(parseInt(tx.dataSize) / 1024)} KB
//                           </p>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className={`font-semibold ${
//                           tx.type === 'Sent' ? 'text-red-600 dark:text-red-400' :
//                           tx.type === 'Received' ? 'text-green-600 dark:text-green-400' :
//                           tx.type === 'Profile Creation' ? 'text-purple-600 dark:text-purple-400' :
//                           'text-blue-600 dark:text-blue-400'
//                         }`}>
//                           {tx.amount}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">{tx.timestamp}</p>
//                       </div>
//                     </div>
//                     <div className="mt-2 flex items-center justify-between">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         tx.status === 'Completed' 
//                           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                           : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
//                       }`}>
//                         {tx.status}
//                       </span>
//                       <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
//                         ID: {tx.id.slice(0, 8)}...{tx.id.slice(-8)}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <p className="text-lg">No transactions found</p>
//               <p className="text-sm mt-2">Your transaction history will appear here</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard; 