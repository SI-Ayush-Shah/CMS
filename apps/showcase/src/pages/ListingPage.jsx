import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import CricketNewsCard from '../components/CricketNewsCard'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { useInfiniteQuery } from '@tanstack/react-query'
import { contentApi } from '../services/contentApi'

function ListingPage() {
  // Infinite scroll configuration
  const pageSize = 8;
  
  // Infinite query for blog posts
  const { 
    data: blogData, 
    isLoading: isBlogLoading, 
    isFetching: isBlogFetching, 
    isError: isBlogError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["blogPosts", { pageSize, status: "published" }],
    queryFn: ({ pageParam = 1 }) =>
      contentApi.fetchBlogPosts({ page: pageParam, pageSize, status: "published", sort: "desc" }),
    getNextPageParam: (lastPage) => {
      // If we have more items than the current page size, there's a next page
      if (lastPage.items.length === pageSize) {
        return lastPage.page + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
  });
  
  // Flatten all pages into a single array of posts
  const blogPosts = blogData?.pages?.flatMap(page => page.items) || [];
  
  // Determine loading and error states
  const isLoading = isBlogLoading;
  const isFetching = isBlogFetching;
  const isError = isBlogError;

  // Format date helper function
  const formatDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  // Infinite scroll functionality
  const observerRef = useRef();
  const lastPostRef = useCallback((node) => {
    if (isLoading || isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        console.log('🔄 Last post visible, fetching next page...');
        fetchNextPage();
      }
    });
    
    if (node) {
      console.log('👁️ Observing last post for infinite scroll');
      observerRef.current.observe(node);
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold  mb-2" >
            <span style={{ color: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}>Rajasthan Royals news</span>
          </div>
          <div className="h-[7px] mx-auto w-64 mb-1" style={{ background: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}></div>
          <div className="h-1 mx-auto w-64" style={{ background: 'linear-gradient(90deg, hsl(var(--color-hsl-primary-dark)) 0.93%, hsl(var(--color-hsl-secondary-dark)) 100%)' }}></div>
        </div>
        
        {/* Loading State */}
        {(isLoading || isFetching) && blogPosts.length === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader text="Loading posts..." />
          </div>
        )}
        
        {/* Error State */}
        {isError && (
          <div className="text-center text-red-600 mb-6">
            Failed to load posts. Please try again.
          </div>
        )}
        
        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center pt-3">
          {/* Blog Posts from API */}
          {blogPosts.map((post, index) => {
            // Add ref to the last post for infinite scroll
            const isLastPost = index === blogPosts.length - 1;
            return (
              <CricketNewsCard
                key={post.id}
                id={post.id}
                title={post.title}
                date={formatDate(post.createdAt)}
                imageUrl={post.coverImageUrl || post.image}
                description={post.summary}
                ref={isLastPost ? lastPostRef : undefined}
              />
            );
          })}
          
          {/* No posts found message */}
          {!isLoading && !isFetching && blogPosts.length === 0 && (
            <div className="col-span-full text-center text-gray-600 py-8">
              No posts found.
            </div>
          )}
          
          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="col-span-full flex justify-center py-4">
              <Loader text="Loading more posts..." />
            </div>
          )}
          
          {/* End of content indicator */}
          {!hasNextPage && blogPosts.length > 0 && (
            <div className="col-span-full text-center text-gray-500 py-4">
              You've reached the end of all posts.
            </div>
          )}
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default ListingPage 