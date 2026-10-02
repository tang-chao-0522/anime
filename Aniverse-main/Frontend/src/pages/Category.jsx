import {useParams} from 'react-router-dom';
import AnimeCards from '../components/AnimeCards';
import {useSelector, useDispatch} from 'react-redux';
import {fetchCategoryAnimeData, clearCategoryData} from '../redux/apifetch/GetanimeDataSlice';
import {useCallback, useEffect, useState} from 'react';
import LoadingAnimation from '../components/LoadingAnimation';


const Category = () => {
    const dispatch = useDispatch();
    const {name} = useParams();
    const [page, setPage] = useState(1);
    const {CategoryAnimeData} = useSelector((state) => state.AnimeData);
    const animes = CategoryAnimeData ?. data ?. data ?. animes || [];
    const hasMore = CategoryAnimeData?.data?.data?.hasNextPage === true;

    useEffect(() => {
        setPage(1);
        dispatch(fetchCategoryAnimeData({name, page: 1}));
        
        // Clear category data when component unmounts
        return () => {
            dispatch(clearCategoryData());
        };
    }, [dispatch, name]);

    const fetchMoreData = useCallback(async () => {
        const nextPage = page + 1;
        await dispatch(fetchCategoryAnimeData({name, page: nextPage})).unwrap();
        setPage(nextPage);
    }, [dispatch, name, page]);

    if (!animes || animes.length === 0) {
        return (
            <div className='w-screen overflow-hidden'>
                <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
                    <LoadingAnimation />
                </div>
            </div>
        );
    }


    return (
        <div className="mt-16">
           
            <AnimeCards data={animes}
                name={
                    name.toUpperCase()
                }
                scroll={false}
                fetchMoreData={fetchMoreData}
                hasMore={hasMore}/>
        </div>
    );
};

export default Category;
