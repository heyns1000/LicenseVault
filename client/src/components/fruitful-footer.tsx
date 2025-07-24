import fruitfulThankYou from "@assets/Fruitful.thank.you_1753366706794.png";

interface FruitfulFooterProps {
  className?: string;
}

export default function FruitfulFooter({ className = "" }: FruitfulFooterProps) {
  return (
    <div className={`w-full flex justify-center py-8 ${className}`}>
      <img 
        src={fruitfulThankYou} 
        alt="FRUITFUL. THANK. YOU" 
        className="max-w-md w-full h-auto"
      />
    </div>
  );
}