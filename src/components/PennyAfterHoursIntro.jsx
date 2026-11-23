import PennyKandyReel from './PennyKandyReel.jsx'

// Shared copy keeps Penny's After Hours introduction identical on mobile and desktop.
export function PennyAfterHoursBio({ className }) {
  return (
    <p className={className}>
      Hey there, gorgeous. I'm Penny Bella Morningstar, the pink-lit temptation
      behind WildCard DEV's velvet door. Sweet smile, sharp tongue, wicked imagination.
      Come a little closer. ♠💋
    </p>
  )
}

export function PennyAfterHoursMoreInfo() {
  return (
    <>
      <p>
        Blonde hair, a flame-red streak, and a weakness for midnight confessions.
        Some nights I'm all satin and soft smiles. Other nights, I like to see
        who can keep up with me. 😈
      </p>
      <p>
        This is my corner of WildCard: photos worth a second look, videos
        made for after dark, and friends who know how to steal the spotlight.
        Stay curious, enjoy the view, and don't be shy about saying hello. 🖤
      </p>
      <PennyKandyReel />
    </>
  )
}
