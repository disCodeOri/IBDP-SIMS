import { Button } from '@/components/ui/button';

interface NewSectionButtonProps {
    onAdd: () => void;
}

const NewSectionButton: React.FC<NewSectionButtonProps> = ({ onAdd }) => {
    return (
        <div className="flex justify-center mt-8 mb-16">
            <Button onClick={onAdd} className="px-8 py-4 bg-zinc-500 text-white hover:bg-zinc-600">New Idea</Button>
        </div>
    );
};

export default NewSectionButton;