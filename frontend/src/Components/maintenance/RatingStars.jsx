// RatingStars component - displays star rating (1 to 5)
// Two modes:
//   1. Display mode (readOnly=true) - just shows filled/empty stars
//   2. Input mode (readOnly=false) - user can click to select rating

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
            starValue <= rating ? 'text-amber-400' : 'text-slate-600'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-amber-300'}`}
          onClick={() => handleClick(starValue)}
          disabled={readOnly}
          aria-label={`Rate ${starValue} out of 5`}
        >
          {starValue <= rating ? '\u2605' : '\u2606'}
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-1 text-sm text-slate-400">{rating}/5</span>
      )}
    </div>
  )
}

export default RatingStars
