import os

def combine_files(root_dir, output_file):
    target_files = [
        #main/root files
        'indexengineer/src/app/layout.tsx',
        'indexengineer/src/app/page.tsx',
        'indexengineer/src/app/globals.css',
        
        #Scheduler files
        #'indexengineer/src/app/scheduler/page.tsx',
        #'indexengineer/src/components/Calendar.tsx',
        #'indexengineer/src/components/TaskForm.tsx',
        #'indexengineer/src/components/FilterSort.tsx',
        #'indexengineer/src/components/TaskDetails.tsx',
        #'indexengineer/src/components/TaskList.tsx',
        #'indexengineer/src/types/task.ts',
        
        #Components
        'indexengineer/src/components/SearchNavigation.tsx'
        
        # misc config files
        #'indexengineer/next.config.mjs',
        #'indexengineer/tailwind.config.ts',
        #'indexengineer/tsconfig.json',
        #'indexengineer/package.json',
        # 'indexengineer/package-lock.json' #change this bit of code if you are planning to upload the package-lock.json file
    ]

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in target_files:
            full_path = os.path.join(root_dir, file_path)
            if os.path.exists(full_path):
                outfile.write(f"File: {full_path}\n\n")
                try:
                    with open(full_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Error reading file: {str(e)}\n")
                outfile.write("\n\n" + "="*80 + "\n\n")
            else:
                outfile.write(f"File not found: {full_path}\n\n")

# Automatically get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Specify the root directory and output file path relative to the current directory
root_directory = os.path.join(current_dir, "indexengineer")
output_file_path = os.path.join(current_dir, "combined_output.txt")

# Run the function
combine_files(root_directory, output_file_path)
print(f"Combined file created at: {output_file_path}")
