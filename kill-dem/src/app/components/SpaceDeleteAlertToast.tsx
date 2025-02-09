import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SpaceDeleteButtonProps {
  spaceId: number;
  onSpaceDelete: (spaceId: number) => void;
}

export function SpaceDeleteToast({ spaceId, onSpaceDelete }: SpaceDeleteButtonProps) {
  const { toast } = useToast()

  const handleDeleteClick = () => {
    toast({
      title: "Delete Space",
      description: "Are you sure you want to delete this space?",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onSpaceDelete(spaceId)
            toast({
              title: "Space deleted",
              description: `Space ${spaceId + 1} has been deleted successfully.`
            })
          }}
        >
          Delete
        </Button>
      ),
    })
  }

  return (
    <Button variant="destructive" onClick={handleDeleteClick}>
      Delete Space {spaceId + 1}
    </Button>
  )
}