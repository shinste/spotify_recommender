interface SelectProps {
    selected: string
    setSelected: React.Dispatch<React.SetStateAction<string>>
}

const Select: React.FC<SelectProps> = ({selected, setSelected}) => {
    return (
        <select value={selected} id="displaySelect" onChange={(e) => setSelected(e.target.value)} className="py-3 px-4 mb-3 block border-gray-200 rounded-lg text-sm focus:border-purple-500 dark:border-neutral-700 dark:text-neutral-400 dark:focus:ring-neutral-600">
            <option value="All">All Songs/Artists</option>
            <option value="Most">Most Played Songs</option>
            <option value="Top">Your Top Artists</option>
            <option value="Saved">Saved Songs</option>
            <option value="Search">Search</option>
        </select> 
    );
}
export default Select;