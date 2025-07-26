// // Posts.jsx
// import React from 'react';
// // import Post from './Post';

// const Posts = () => {
//   const postData = [
//     {
//       Username: 'Alice',
//       content: 'This is my first post guys',
//       image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
//       likes: 15,
//       comment: []
//     },
//     {
//       Username: 'Haider',
//       content: 'Enjoying the sunshine 🌞',
//       image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//       likes: 8,
//       comment: [{ user: 'Adeel', text: 'Wow!' }]
//     },
//     {
//       Username: 'Ahmad',
//       content: 'Look at this amazing view!',
//       image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
//       likes: 23,
//       comment: [
//         { user: 'Sara', text: 'Beautiful' },
//         { user: 'Ali', text: 'Where is this?' }
//       ]
//     },
//     {
//       Username: 'Zara',
//       content: 'Nature never goes out of style 🍃',
//       image: 'https://images.unsplash.com/photo-1488805990569-3c9e1d76d51c',
//       likes: 12,
//       comment: []
//     },
//     {
//       Username: 'Usman',
//       content: 'Coffee and coding ☕💻',
//       image: 'https://images.stockcake.com/public/2/5/2/2522e9fb-e32a-4727-a205-aa257cd6da3c_large/programming-cafe-vibes-stockcake.jpg',
//       likes: 30,
//       comment: [{ user: 'Zara', text: 'Relatable!' }]
//     }
//   ];

//   return (
//     <div style={{ paddingBottom: '40px' }}>
//       {postData.map((post, index) => (
//         <Post
//           key={index}
//           Username={post.Username}
//           content={post.content}
//           image={post.image}
//           likes={post.likes}
//           comment={post.comment}
//         />
//       ))}
//     </div>
//   );
// };

// export default Posts;
