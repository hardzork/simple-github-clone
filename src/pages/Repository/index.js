import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { GoIssueOpened, GoIssueClosed, GoGlobe } from 'react-icons/go';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  IssuePagination,
  IssueFilter,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filterActive: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      filterActive: 'open',
    });
  }

  handleFilter = async (type, isFilter) => {
    const { match } = this.props;
    const { page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: type,
        per_page: 5,
        page: isFilter ? 1 : page,
      },
    });
    this.setState({
      issues: issues.data,
      filterActive: type,
    });
    if (isFilter) {
      this.setState({ page: 1 });
    }
  };

  handlePagination = async act => {
    const { page, filterActive } = this.state;
    await this.setState({
      page: act === 'next' ? page + 1 : page - 1,
    });
    this.handleFilter(filterActive, false);
  };

  render() {
    const { repository, issues, loading, filterActive, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter filterActive={filterActive}>
          <button
            id="all"
            type="button"
            onClick={() => this.handleFilter('all', true)}
          >
            <GoGlobe size={30} />
            <span>Todas as issues</span>
          </button>
          <button
            id="open"
            type="button"
            onClick={() => this.handleFilter('open', true)}
          >
            <GoIssueOpened size={30} />
            <span>Issues abertas</span>
          </button>
          <button
            id="closed"
            type="button"
            onClick={() => this.handleFilter('closed', true)}
          >
            <GoIssueClosed size={30} />
            <span>Issues fechadas</span>
          </button>
        </IssueFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={issue.html_url}
                  >
                    {issue.title}
                  </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <IssuePagination>
          <button
            disabled={page === 1}
            type="button"
            onClick={() => this.handlePagination('back')}
          >
            <FaCaretLeft /> Anterior
          </button>
          <span>{page}</span>
          <button type="button" onClick={() => this.handlePagination('next')}>
            Próxima <FaCaretRight />
          </button>
        </IssuePagination>
      </Container>
    );
  }
}
