import {useParams} from 'react-router-dom';
import AnimeCards from '../components/AnimeCards';
import {useSelector, useDispatch} from 'react-redux';
import {fetchProducerAnimeData} from '../redux/apifetch/GetanimeDataSlice';
import {useCallback, useEffect, useState} from 'react';


const Producer = () => {
    const dispatch = useDispatch();
    const {name} = useParams();
    const [page, setPage] = useState(1);
    const {ProducerAnimeData} = useSelector((state) => state.AnimeData);
    const animes = ProducerAnimeData?.data?.data?.animes || [];
    const hasMore = ProducerAnimeData?.data?.data?.hasNextPage === true;

    useEffect(() => {
        setPage(1);
        dispatch(fetchProducerAnimeData({name, page: 1}));
    }, [dispatch, name]);

    const fetchMoreData = useCallback(async () => {
        const nextPage = page + 1;
        await dispatch(fetchProducerAnimeData({name, page: nextPage})).unwrap();
        setPage(nextPage);
    }, [dispatch, name, page]);

    return (
        <div className="mt-16">
            <AnimeCards data={animes}
                name={
                    ProducerAnimeData?.data?.data?.producerName.toUpperCase()
                }
                scroll={false}
                fetchMoreData={fetchMoreData}
                hasMore={hasMore}/>
        </div>
    );
};

export default Producer;
