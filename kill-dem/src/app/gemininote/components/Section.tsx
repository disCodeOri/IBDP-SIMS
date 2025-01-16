import { useState } from 'react';
import Card from '@/app/gemininote/components/card';
import { Button } from '@/components/ui/button';
import { ArrowDownFromLine } from 'lucide-react';

interface SectionProps {
    title: string;
    cards: string[];
    onCardAdd: (newCard: string) => void;
    onCardChange: (index: number, newText: string) => void;
    onArchive: () => void;
}

const Section: React.FC<SectionProps> = ({ title, cards, onCardAdd, onCardChange, onArchive }) => {
    const handleAddNewCard = () => {
        onCardAdd('add some content');
    }

    const handleCardTextChange = (index: number, newText: string) => {
        onCardChange(index, newText);
    }
    return (
        <div className="mb-8 pb-4 border-b-2 border-zinc-200">
            <div className='flex justify-between items-start mb-4'>
                <h2 className="text-2xl font-semibold ">{title}</h2>
                 <Button variant='ghost' size="sm" onClick={onArchive} className='px-2 py-1'>
                    <ArrowDownFromLine className='mr-2 h-4 w-4'/>
                    Archive
                </Button>
            </div>

            {cards.map((cardText, index) => (
                <Card
                key={index}
                  text={cardText}
                    onTextChange={(newText) => handleCardTextChange(index, newText)}
                />
            ))}
            <Button size='sm' variant='outline' onClick={handleAddNewCard}>Add New Card</Button>

        </div>
    );
};

export default Section;