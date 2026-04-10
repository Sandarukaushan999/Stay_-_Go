// RatingStars component - displays star rating (1 to 5)
// Two modes: display (readOnly) and input (clickable)

function RatingStars({ rating = 0, onRate, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5]

  function handleClick(starValue) {
    if (!readOnly && onRate) {
      onRate(starValue)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {stars.map((starValue) => (
        <button
          key={starValue}
          type="button"
          className={`text-xl transition ${
            starValue <= rating ? 'text-[#f59e0b]' : 'text-[#101312]/15'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-[#f59e0b]/70'}`}
          onClick={() => handleClick(starValue)}
          disabled={readOnly}
          aria-label={`Rate ${starValue} out of 5`}
        >
          {starValue <= rating ? '\u2605' : '\u2606'}
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-1 text-sm font-medium text-[#101312]/80">{rating}/5</span>
      )}
    </div>
  )
}

export default RatingStars
