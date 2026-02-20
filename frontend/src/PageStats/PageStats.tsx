import type { Page } from "../TS/Enum"
import "./PageStats.css"

interface PageStatsProps {
    page: Page
    changePage: () => void
}

const PageStats: React.FC<PageStatsProps> = ({page, changePage}) => {

    return (
        <div className="">
            test
        </div>
    )
}

export default PageStats;