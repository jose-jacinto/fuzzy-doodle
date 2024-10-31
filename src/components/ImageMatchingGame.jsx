import React, { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'

function generateNumericHash(email) {
  const normalizedEmail = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalizedEmail.length; i++) {
      const char = normalizedEmail.charCodeAt(i);
      hash = (hash * 31 + char) % 1000000007; // Using a large prime number for distribution
  }
}

const ImageMatchingGame = () => {

  const fragment = window.location.hash.substring(1);
  // Create a single supabase client for interacting with your database
  const supabase = createClient('https://fgdcwqmfstbspzwotoxd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZGN3cW1mc3Ric3B6d290b3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNzg2NzgsImV4cCI6MjA0NTk1NDY3OH0.-kC2o9L3WYLJrcD_q-7ECgxsV4Q_AYNz51jdkYG66eo')

  const [matches, setMatches] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  
  const imagePairs = [
    { id: 1, source: '/images/m1.png', target: '/images/1.png' },
    { id: 2, source: '/images/m2.png', target: '/images/2.png' },
    { id: 3, source: '/images/m3.png', target: '/images/3.png' },
    { id: 4, source: '/images/m4.png', target: '/images/4.png' },
    { id: 5, source: '/images/m5.png', target: '/images/5.png' },
    { id: 6, source: '/images/m6.png', target: '/images/6.png' },
  ];

  

  // Handle both mouse and touch events
  const handleDragStart = (e, id) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
      setDraggedId(id);
    } else {
      e.dataTransfer.setData('text/plain', id.toString());
      setDraggedId(id);
    }
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    setDraggedId(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elements.find(el => el.dataset.isDropTarget);
    
    // Remove highlight from all drop targets
    document.querySelectorAll('[data-is-drop-target]').forEach(el => 
      el.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50')
    );
    
    // Add highlight to current drop target
    if (dropTarget) {
      dropTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer?.getData('text/plain') || draggedId;
    
    if (!sourceId) return;
    
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
    
    setMatches(prev => ({
      ...prev,
      [sourceId]: targetId
    }));

    if (Object.keys(matches).length + 1 === imagePairs.length) {
      setShowSuccess(true);
      console.log('Submitting matches:', { ...matches, [sourceId]: targetId });
      console.log(generateNumericHash(decodeURIComponent(fragment)))
      supabase
        .from('recordati')
        .insert({ id: generateNumericHash(decodeURIComponent(fragment)), results: { ...matches, [sourceId]: targetId }, email: decodeURIComponent(fragment) }).then(el => {
          console.log(el)
        })

    }
  }, [matches, imagePairs.length, draggedId]);

  const handleTouchEnd = (e, targetId) => {
    if (!draggedId) return;
    
    const touch = e.changedTouches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elements.find(el => el.dataset.isDropTarget);
    
    if (dropTarget && dropTarget.dataset.targetId) {
      handleDrop({ preventDefault: () => {}, dataTransfer: null }, parseInt(dropTarget.dataset.targetId));
    }
    
    setDraggedId(null);
    document.querySelectorAll('[data-is-drop-target]').forEach(el => 
      el.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50')
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top decorative image - smaller on mobile */}
 

      {/* Main game container - better padding on mobile */}
      <div className="max-w-4xl mx-auto -mt-16 sm:-mt-24 px-4 pb-8 sm:pb-12">
        <div className="bg-white ">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-12 text-gray-800">
           
          </h1>

          <img
            src="/images/recordati_lp1.jpg"
            alt="Top decoration"
            className="w-full h-full object-cover"
          />
          
          {/* Grid layout - stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Source images */}
            <div className="space-y-4 sm:space-y-6">
              {/* <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                Drag these images
              </h2> */}
              {imagePairs.map(pair => (
                <div
                  key={`source-${pair.id}`}
                  className="transform transition-all duration-200 active:scale-95 hover:scale-105"
                  draggable
                  onDragStart={(e) => handleDragStart(e, pair.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e, pair.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, pair.id)}
                >
                  <div className="p-2 sm:p-3 cursor-move hover:border-blue-400 active:border-blue-600 transition-colors" style={{ margin: 'auto', width: 200}}>
                    <img
                      src={pair.source}
                      alt={`Source ${pair.id}`}
                      className="w-full"
                      draggable="false"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Target images */}
            <div className="space-y-4 sm:space-y-6">
              {/* <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                Drop to match
              </h2> */}
              {imagePairs.map(pair => (
                <div
                  key={`target-${pair.id}`}
                  data-is-drop-target="true"
                  data-target-id={pair.id}
                  className={`mt-10 p-2 sm:p-3 transition-all duration-200
                    ${Object.values(matches).includes(pair.id)
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 hover:border-blue-300'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, pair.id)}
                  style={{ margin: 'auto', width: 200, marginTop: 15 }}
                >
                  <img
                    src={pair.target}
                    alt={`Target ${pair.id}`}
                    className="w-full "
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Success message */}
          {/* {showSuccess && (

              <p> Perfect match! All images have been correctly paired.</p>
             
          )} */}
          {/* <h1 className="text-slate-900 text-lg text-center mt-10"> Perfect match! All images have been correctly paired.</h1> */}
        </div>
        <img
            src="/images/recordati_lp2.jpg"
            alt="Top decoration"
            className="w-full h-full object-cover"
          />
      </div>

   
    </div>
  );
};

export default ImageMatchingGame;