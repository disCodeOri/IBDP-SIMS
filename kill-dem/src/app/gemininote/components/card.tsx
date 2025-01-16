import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  text: string;
  onTextChange: (newText: string) => void;
}

const Card: React.FC<CardProps> = ({ text, onTextChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
  };
  return (
    <div
      className="bg-yellow-100 p-3 rounded shadow-sm mb-4 relative"
      style={{ borderLeft: '3px solid #ddd' }}
    >
      {isEditing ? (
        <Input
          onBlur={handleBlur}
          autoFocus
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className='ring-0 border-none focus:border-none focus-visible:border-none'
        />
      ) : (
        <div onClick={() => setIsEditing(true)} className=" whitespace-pre-line ">
          {text}
        </div>
      )}
      <div className="flex justify-between mt-2">
        <Input
        className='w-auto text-xs border-0 bg-transparent file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-zinc-200 file:cursor-pointer file:hover:bg-zinc-300 file:focus:bg-zinc-300'
          type="file"
        />
      </div>
    </div>
  );
};

export default Card;